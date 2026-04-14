import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFetch, useToast } from "../../hooks";
import { Toast, EmptyState, Modal, Spinner } from "../../components/common";
import api from "../../services/api";

const CourseCard = ({ course }) => (
  <Link
    to={`/course/${course._id}`}
    className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden block"
  >
    <div className="h-24 flex items-end p-4" style={{ backgroundColor: course.coverColor }}>
      <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
        {course.subject || "Course"}
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-display font-semibold text-slate-900 mb-1 truncate">{course.title}</h3>
      <p className="text-xs text-slate-500">{course.teacherId?.name}</p>
      {course.description && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description}</p>
      )}
    </div>
  </Link>
);

const JoinCourseModal = ({ onClose, onJoined }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setError("Please enter a course code.");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/courses/join", { courseCode: code.trim() });
      onJoined(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Join a Course" onClose={onClose}>
      <form onSubmit={handleJoin} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Course Code</label>
          <input
            className="input uppercase tracking-widest font-mono"
            placeholder="e.g. A1B2C3D4"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1.5">Ask your teacher for the course code.</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Joining…</> : "Join Course"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: courses, loading, refetch, setData } = useFetch("/api/courses/enrolled");
  const [showJoin, setShowJoin] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  const handleJoined = (course) => {
    setData((prev) => [course, ...(prev || [])]);
    setShowJoin(false);
    showToast(`Joined "${course.title}" successfully!`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {showJoin && <JoinCourseModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <button onClick={() => setShowJoin(true)} className="btn-primary flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Join Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : courses?.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>}
          title="No courses yet"
          description="Join a course using the code your teacher shared with you."
          action={<button onClick={() => setShowJoin(true)} className="btn-primary">Join Your First Course</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>
      )}
    </div>
  );
}
