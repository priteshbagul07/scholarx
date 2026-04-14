import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const ParticipantVideo = ({ stream, userName, isMuted, isVideoOff, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-xl">
            {userName?.[0]?.toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full truncate max-w-[70%]">
          {userName} {isLocal && "(You)"}
        </span>
        {isMuted && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            🔇
          </span>
        )}
      </div>
    </div>
  );
};

export default function LiveClassPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId");
  const classId = searchParams.get("classId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const chatBottomRef = useRef(null);

  const isTeacher = user?.role === "teacher";

  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit("webrtc-ice-candidate", {
          targetSocketId,
          candidate: e.candidate,
          fromSocketId: socketRef.current.id,
        });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: e.streams[0] }));
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peersRef.current[targetSocketId] = pc;
    return pc;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        setLocalStream(stream);
        setConnected(true);

        const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5050");
        socketRef.current = socket;

        socket.emit("join-room", {
          roomId,
          userId: user._id,
          userName: user.name,
          role: user.role,
        });

        socket.on("existing-participants", async (participants) => {
          for (const p of participants) {
            const pc = createPeerConnection(p.socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", {
              targetSocketId: p.socketId,
              offer,
              fromSocketId: socket.id,
              fromUserName: user.name,
            });
          }
        });

        socket.on("user-joined", async ({ socketId, userName }) => {
          // peer will send offer
        });

        socket.on("webrtc-offer", async ({ offer, fromSocketId }) => {
          const pc = createPeerConnection(fromSocketId);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { targetSocketId: fromSocketId, answer, fromSocketId: socket.id });
        });

        socket.on("webrtc-answer", async ({ answer, fromSocketId }) => {
          const pc = peersRef.current[fromSocketId];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("webrtc-ice-candidate", async ({ candidate, fromSocketId }) => {
          const pc = peersRef.current[fromSocketId];
          if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on("participants-updated", (p) => setParticipants(p));

        socket.on("user-left", ({ socketId }) => {
          if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
          }
          setRemoteStreams((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
        });

        socket.on("live-chat-message", (msg) => {
          setChatMessages((prev) => [...prev, msg]);
          if (!showChat) setUnread((n) => n + 1);
        });

        socket.on("class-ended", () => {
          alert("The live class has ended.");
          navigate(courseId ? `/course/${courseId}` : "/dashboard");
        });
      } catch (err) {
        setError("Could not access camera/microphone. Please check your permissions.");
        console.error(err);
      }
    };

    init();

    return () => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleMute = () => {
    const audioTracks = localStreamRef.current?.getAudioTracks();
    if (audioTracks) {
      const newMuted = !isMuted;
      audioTracks.forEach((t) => (t.enabled = !newMuted));
      setIsMuted(newMuted);
      socketRef.current?.emit("toggle-audio", { roomId, isMuted: newMuted });
    }
  };

  const toggleVideo = () => {
    const videoTracks = localStreamRef.current?.getVideoTracks();
    if (videoTracks) {
      const newOff = !isVideoOff;
      videoTracks.forEach((t) => (t.enabled = !newOff));
      setIsVideoOff(newOff);
      socketRef.current?.emit("toggle-video", { roomId, isVideoOff: newOff });
    }
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit("live-chat-message", {
      roomId,
      message: chatInput,
      userName: user.name,
      userId: user._id,
      timestamp: new Date().toISOString(),
    });
    setChatInput("");
  };

  const handleLeave = async () => {
    if (isTeacher) {
      socketRef.current?.emit("end-class", { roomId });
      try {
        const api = (await import("../../services/api")).default;
        await api.patch(`/api/live/${classId}/end`);
      } catch {}
    }
    navigate(courseId ? `/course/${courseId}` : "/dashboard");
  };

  const openChat = () => {
    setShowChat(true);
    setUnread(0);
  };

  const remoteEntries = Object.entries(remoteStreams);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="bg-white text-slate-900 px-6 py-2 rounded-lg font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-semibold text-sm">Live Class</span>
          <span className="text-slate-400 text-xs">{participants.length} participant{participants.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={handleLeave} className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
          {isTeacher ? "End Class" : "Leave"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Videos grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className={`grid gap-3 h-full ${remoteEntries.length === 0 ? "grid-cols-1" : remoteEntries.length === 1 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
            {localStream && (
              <ParticipantVideo
                stream={localStream}
                userName={user.name}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                isLocal
              />
            )}
            {remoteEntries.map(([socketId, stream]) => {
              const participant = participants.find((p) => p.socketId === socketId);
              return (
                <ParticipantVideo
                  key={socketId}
                  stream={stream}
                  userName={participant?.userName || "Participant"}
                  isMuted={false}
                  isVideoOff={false}
                />
              );
            })}
            {!connected && (
              <div className="bg-slate-800 rounded-xl aspect-video flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-72 border-l border-slate-700 flex flex-col bg-slate-800">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <span className="text-white text-sm font-medium">Chat</span>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No messages yet</p>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.userId === user._id ? "text-right" : ""}`}>
                  <span className="text-slate-400 text-xs block mb-0.5">{msg.userName}</span>
                  <span className={`inline-block px-3 py-1.5 rounded-xl text-sm ${msg.userId === user._id ? "bg-brand-500 text-white" : "bg-slate-700 text-white"}`}>
                    {msg.message}
                  </span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <form onSubmit={sendChat} className="p-3 border-t border-slate-700 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="submit" className="bg-brand-500 text-white px-3 py-2 rounded-lg text-sm">↑</button>
            </form>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-4 flex items-center justify-center gap-3 border-t border-slate-700">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          )}
        </button>

        <button
          onClick={showChat ? () => setShowChat(false) : openChat}
          className="w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-600 flex items-center justify-center transition-colors relative"
          title="Toggle chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <button
          onClick={handleLeave}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
          title="Leave"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
