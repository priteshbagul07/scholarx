const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  const liveRooms = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, userId, userName, role }) => {
      socket.join(roomId);

      if (!liveRooms.has(roomId)) {
        liveRooms.set(roomId, new Map());
      }

      liveRooms.get(roomId).set(socket.id, { userId, userName, role, socketId: socket.id });

      const participants = Array.from(liveRooms.get(roomId).values());
      io.to(roomId).emit("participants-updated", participants);

      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        userName,
        role,
      });

      socket.emit("existing-participants", participants.filter((p) => p.socketId !== socket.id));
    });

    socket.on("webrtc-offer", ({ targetSocketId, offer, fromSocketId, fromUserName }) => {
      io.to(targetSocketId).emit("webrtc-offer", { offer, fromSocketId, fromUserName });
    });

    socket.on("webrtc-answer", ({ targetSocketId, answer, fromSocketId }) => {
      io.to(targetSocketId).emit("webrtc-answer", { answer, fromSocketId });
    });

    socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate, fromSocketId }) => {
      io.to(targetSocketId).emit("webrtc-ice-candidate", { candidate, fromSocketId });
    });

    socket.on("live-chat-message", ({ roomId, message, userName, userId, timestamp }) => {
      io.to(roomId).emit("live-chat-message", { message, userName, userId, timestamp, socketId: socket.id });
    });

    socket.on("toggle-audio", ({ roomId, isMuted }) => {
      socket.to(roomId).emit("participant-audio-toggle", { socketId: socket.id, isMuted });
    });

    socket.on("toggle-video", ({ roomId, isVideoOff }) => {
      socket.to(roomId).emit("participant-video-toggle", { socketId: socket.id, isVideoOff });
    });

    socket.on("end-class", ({ roomId }) => {
      io.to(roomId).emit("class-ended");
      liveRooms.delete(roomId);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id && liveRooms.has(roomId)) {
          liveRooms.get(roomId).delete(socket.id);
          const participants = Array.from(liveRooms.get(roomId).values());
          socket.to(roomId).emit("user-left", { socketId: socket.id });
          io.to(roomId).emit("participants-updated", participants);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };
