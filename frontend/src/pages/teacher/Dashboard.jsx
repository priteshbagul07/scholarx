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
    <div className="h-24 flex items-between p-4 relative" style={{ backgroundColor: course.coverColor }}>
      <div className="flex items-start justify-between w-full">
        <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
          {course.subject || "Course"}
        </span>
        <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-mono">
          {course.courseCode}
        </span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-display font-semibold text-slate-900 mb-1 truncate">{course.title}</h3>
      <p className="text-xs text-slate-500">{course.students?.length || 0} students enrolled</p>
      {course.description && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description}</p>
      )}
    </div>
  </Link>
);

const CreateCourseModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: "", description: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Course title is required.");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/courses", form);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create New Course" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Course Title *</label>
          <input name="title" className="input" placeholder="e.g. Physics Class 12" value={form.title} onChange={handleChange} autoFocus required />
        </div>
        <div>
          <label className="label">Subject</label>
          <input name="subject" className="input" placeholder="e.g. Physics, Mathematics" value={form.subject} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" className="input resize-none" rows={3} placeholder="Brief description of the course…" value={form.description} onChange={handleChange} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</> : "Create Course"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: courses, loading, setData } = useFetch("/api/courses/my-courses");
  const [showCreate, setShowCreate] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  const handleCreated = (course) => {
    setData((prev) => [course, ...(prev || [])]);
    setShowCreate(false);
    showToast(`Course "${course.title}" created! Code: ${course.courseCode}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your courses, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : courses?.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>}
          title="No courses yet"
          description="Create your first course and share the code with your students."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create First Course</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => <CourseCard key={course._id} course={course} />)}
        </div>
      )}
    </div>
  );
}
