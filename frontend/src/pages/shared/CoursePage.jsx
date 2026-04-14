import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFetch, useToast, useConfirm } from "../../hooks";
import { Spinner, EmptyState, Toast, Modal, Badge, Confirm, Avatar } from "../../components/common";
import { formatDate, formatDateTime, isOverdue, timeAgo, buildFileUrl, getYouTubeEmbedUrl, isYouTubeUrl } from "../../utils/helpers";
import api from "../../services/api";

// ─── Lectures Tab ───────────────────────────────────────────────────────────

const LecturePlayer = ({ lecture, onClose }) => {
  const videoUrl = lecture.type === "url" ? getYouTubeEmbedUrl(lecture.videoUrl) : buildFileUrl(lecture.filePath);
  return (
    <Modal title={lecture.title} onClose={onClose} maxWidth="max-w-4xl">
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
        {lecture.type === "url" && isYouTubeUrl(lecture.videoUrl) ? (
          <iframe src={videoUrl} className="w-full h-full" allowFullScreen title={lecture.title} />
        ) : lecture.type === "url" ? (
          <video src={videoUrl} controls className="w-full h-full" />
        ) : (
          <video src={videoUrl} controls className="w-full h-full" />
        )}
      </div>
      {lecture.description && <p className="text-sm text-slate-500">{lecture.description}</p>}
    </Modal>
  );
};

const AddLectureModal = ({ courseId, onClose, onAdded }) => {
  const [form, setForm] = useState({ title: "", description: "", type: "url", videoUrl: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (form.type === "url" && !form.videoUrl.trim()) return setError("Video URL is required.");
    if (form.type === "file" && !file) return setError("Please select a video file.");

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("type", form.type);
      fd.append("courseId", courseId);
      if (form.type === "url") fd.append("videoUrl", form.videoUrl);
      if (form.type === "file" && file) fd.append("video", file);

      const { data } = await api.post("/api/lectures", fd);
      onAdded(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lecture.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Lecture" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Lecture title" autoFocus required />
        </div>
        <div>
          <label className="label">Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
        </div>
        <div>
          <label className="label">Upload Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["url", "file"].map((t) => (
              <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${form.type === t ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-200 text-slate-500"}`}>
                {t === "url" ? "🔗 URL / YouTube" : "📁 Upload File"}
              </button>
            ))}
          </div>
        </div>
        {form.type === "url" ? (
          <div>
            <label className="label">Video URL</label>
            <input className="input" value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="YouTube or direct video URL" />
          </div>
        ) : (
          <div>
            <label className="label">Video File</label>
            <input type="file" accept="video/mp4,video/mkv,video/webm" onChange={(e) => setFile(e.target.files[0])} className="input py-1.5 text-sm" />
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding…</> : "Add Lecture"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const LecturesTab = ({ courseId, isTeacher }) => {
  const { data: lectures, loading, setData } = useFetch(`/api/lectures/course/${courseId}`);
  const [showAdd, setShowAdd] = useState(false);
  const [playing, setPlaying] = useState(null);
  const { confirm, askConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleDelete = async (id) => {
    const ok = await askConfirm("Delete this lecture? This action cannot be undone.");
    if (!ok) return;
    await api.delete(`/api/lectures/${id}`);
    setData((prev) => prev.filter((l) => l._id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      {confirm && <Confirm message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showAdd && <AddLectureModal courseId={courseId} onClose={() => setShowAdd(false)} onAdded={(l) => { setData((p) => [...(p || []), l]); setShowAdd(false); }} />}
      {playing && <LecturePlayer lecture={playing} onClose={() => setPlaying(null)} />}

      {isTeacher && (
        <div className="flex justify-end mb-5">
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Lecture
          </button>
        </div>
      )}

      {lectures?.length === 0 ? (
        <EmptyState icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>} title="No lectures yet" description={isTeacher ? "Add your first lecture to get started." : "Your teacher hasn't uploaded lectures yet."} />
      ) : (
        <div className="space-y-3">
          {lectures.map((lec, idx) => (
            <div key={lec._id} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 flex-shrink-0 font-bold text-sm">{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{lec.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={lec.type === "url" ? "info" : "default"}>{lec.type === "url" ? "URL" : "File"}</Badge>
                  {lec.description && <span className="text-xs text-slate-400 truncate">{lec.description}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPlaying(lec)} className="btn-secondary text-xs py-1.5 px-3">Watch</button>
                {isTeacher && (
                  <button onClick={() => handleDelete(lec._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Assignments Tab ─────────────────────────────────────────────────────────

const AddAssignmentModal = ({ courseId, onClose, onAdded }) => {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxMarks: 100 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return setError("Title and due date are required.");
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("courseId", courseId);
      if (file) fd.append("file", file);
      const { data } = await api.post("/api/assignments", fd);
      onAdded(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create Assignment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Assignment title" autoFocus required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Instructions for students…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Due Date *</label>
            <input type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Max Marks</label>
            <input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm((p) => ({ ...p, maxMarks: e.target.value }))} min={1} />
          </div>
        </div>
        <div>
          <label className="label">Attachment (PDF)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="input py-1.5 text-sm" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</> : "Create Assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const SubmitModal = ({ assignment, onClose, onSubmitted }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file to submit.");
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("assignmentId", assignment._id);
      fd.append("file", file);
      const { data } = await api.post("/api/submissions", fd);
      onSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Submit: ${assignment.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Your Submission File</label>
          <input type="file" accept=".pdf,.doc,.docx,.zip,.txt" onChange={(e) => setFile(e.target.files[0])} className="input py-1.5 text-sm" />
          <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, ZIP, or TXT</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</> : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AssignmentsTab = ({ courseId, isTeacher }) => {
  const { data: assignments, loading, setData } = useFetch(`/api/assignments/course/${courseId}`);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const { confirm, askConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleDelete = async (id) => {
    const ok = await askConfirm("Delete this assignment?");
    if (!ok) return;
    await api.delete(`/api/assignments/${id}`);
    setData((prev) => prev.filter((a) => a._id !== id));
  };

  const handleSubmitted = (sub) => {
    setData((prev) => prev.map((a) => a._id === sub.assignmentId ? { ...a, submission: sub } : a));
    setSubmitting(null);
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      {confirm && <Confirm message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {showAdd && <AddAssignmentModal courseId={courseId} onClose={() => setShowAdd(false)} onAdded={(a) => { setData((p) => [a, ...(p || [])]) ; setShowAdd(false); }} />}
      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} onSubmitted={handleSubmitted} />}

      {isTeacher && (
        <div className="flex justify-end mb-5">
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Create Assignment
          </button>
        </div>
      )}

      {assignments?.length === 0 ? (
        <EmptyState icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} title="No assignments" description={isTeacher ? "Create the first assignment for this course." : "No assignments have been posted yet."} />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const overdue = isOverdue(a.dueDate);
            const submitted = a.submission;
            return (
              <div key={a._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900">{a.title}</h3>
                      {!isTeacher && submitted && <Badge variant="success">Submitted</Badge>}
                      {!isTeacher && !submitted && overdue && <Badge variant="danger">Overdue</Badge>}
                      {!isTeacher && !submitted && !overdue && <Badge variant="warning">Pending</Badge>}
                    </div>
                    {a.description && <p className="text-sm text-slate-500 mb-2">{a.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Due: {formatDateTime(a.dueDate)}</span>
                      <span>Max: {a.maxMarks} marks</span>
                      {submitted?.grade !== null && submitted?.grade !== undefined && (
                        <span className="text-emerald-600 font-medium">Grade: {submitted.grade}/{a.maxMarks}</span>
                      )}
                    </div>
                    {a.filePath && (
                      <a href={buildFileUrl(a.filePath)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-500 mt-2 hover:underline">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Download attachment
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isTeacher && !submitted && !overdue && (
                      <button onClick={() => setSubmitting(a)} className="btn-primary text-xs py-1.5 px-3">Submit</button>
                    )}
                    {!isTeacher && !submitted && overdue && (
                      <button onClick={() => setSubmitting(a)} className="btn-secondary text-xs py-1.5 px-3">Submit Late</button>
                    )}
                    {isTeacher && (
                      <button onClick={() => handleDelete(a._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Announcements Tab ────────────────────────────────────────────────────────

const AnnouncementsTab = ({ courseId, isTeacher }) => {
  const { data: announcements, loading, setData } = useFetch(`/api/announcements/course/${courseId}`);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const { confirm, askConfirm, handleConfirm, handleCancel } = useConfirm();

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post("/api/announcements", { text, courseId });
      setData((prev) => [data, ...(prev || [])]);
      setText("");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await askConfirm("Delete this announcement?");
    if (!ok) return;
    await api.delete(`/api/announcements/${id}`);
    setData((prev) => prev.filter((a) => a._id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div>
      {confirm && <Confirm message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}

      {isTeacher && (
        <form onSubmit={handlePost} className="card p-4 mb-5">
          <textarea
            className="input resize-none mb-3"
            rows={3}
            placeholder="Share an update with your class…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <button type="submit" disabled={posting || !text.trim()} className="btn-primary text-sm flex items-center gap-2">
              {posting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Post Announcement
            </button>
          </div>
        </form>
      )}

      {announcements?.length === 0 ? (
        <EmptyState icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} title="No announcements" description={isTeacher ? "Post an announcement to update your students." : "No announcements yet."} />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar name={a.authorId?.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{a.authorId?.name}</span>
                      <span className="text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{a.text}</p>
                  </div>
                </div>
                {isTeacher && (
                  <button onClick={() => handleDelete(a._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── People Tab ───────────────────────────────────────────────────────────────

const PeopleTab = ({ course, isTeacher, onStudentRemoved }) => {
  const { confirm, askConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleRemove = async (studentId, name) => {
    const ok = await askConfirm(`Remove ${name} from this course?`);
    if (!ok) return;
    await api.delete(`/api/courses/${course._id}/students/${studentId}`);
    onStudentRemoved(studentId);
  };

  return (
    <div>
      {confirm && <Confirm message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <div className="card p-5 mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Teacher</h3>
        <div className="flex items-center gap-3">
          <Avatar name={course.teacherId?.name} />
          <div>
            <p className="font-medium text-slate-900">{course.teacherId?.name}</p>
            <p className="text-xs text-slate-500">{course.teacherId?.email}</p>
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Students ({course.students?.length || 0})
        </h3>
        {course.students?.length === 0 ? (
          <p className="text-sm text-slate-400">No students enrolled yet.</p>
        ) : (
          <div className="space-y-3">
            {course.students?.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                </div>
                {isTeacher && (
                  <button onClick={() => handleRemove(s._id, s.name)} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Remove</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ["Lectures", "Assignments", "Announcements", "People"];

export default function CoursePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: course, loading, setData } = useFetch(`/api/courses/${courseId}`);
  const [activeTab, setActiveTab] = useState("Lectures");
  const { toast, showToast, clearToast } = useToast();

  const isTeacher = user?.role === "teacher" && course?.teacherId?._id === user._id;

  const handleStartLive = async () => {
    try {
      const { data } = await api.post("/api/live/start", { courseId, title: `${course.title} - Live` });
      navigate(`/live/${data.roomId}?courseId=${courseId}&classId=${data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to start live class.", "error");
    }
  };

  const handleJoinLive = async () => {
    try {
      const { data } = await api.get(`/api/live/course/${courseId}/active`);
      navigate(`/live/${data.roomId}?courseId=${courseId}&classId=${data._id}`);
    } catch {
      showToast("No live class is currently active.", "error");
    }
  };

  const handleStudentRemoved = (studentId) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s._id !== studentId),
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!course) return <div className="text-center py-20 text-slate-500">Course not found.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Course header */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: course.coverColor }}>
        <div className="p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{course.subject || "Course"}</p>
              <h1 className="font-display font-bold text-2xl">{course.title}</h1>
              <p className="text-white/80 text-sm mt-1">{course.teacherId?.name}</p>
              {course.description && <p className="text-white/70 text-sm mt-2 max-w-xl">{course.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              {isTeacher && (
                <div className="bg-white/20 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold tracking-wider">
                  Code: {course.courseCode}
                </div>
              )}
              {isTeacher ? (
                <button onClick={handleStartLive} className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 bg-white rounded-full live-pulse"></span>
                  Start Live Class
                </button>
              ) : (
                <button onClick={handleJoinLive} className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 bg-red-400 rounded-full live-pulse"></span>
                  Join Live Class
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-brand-600 border-brand-500"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "Lectures" && <LecturesTab courseId={courseId} isTeacher={isTeacher} />}
        {activeTab === "Assignments" && <AssignmentsTab courseId={courseId} isTeacher={isTeacher} />}
        {activeTab === "Announcements" && <AnnouncementsTab courseId={courseId} isTeacher={isTeacher} />}
        {activeTab === "People" && <PeopleTab course={course} isTeacher={isTeacher} onStudentRemoved={handleStudentRemoved} />}
      </div>
    </div>
  );
}
