import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Feature = ({ icon, title, desc }) => (
  <div className="card p-6 hover:shadow-md transition-shadow duration-300">
    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Scholar X</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
          100% Free — No hidden fees, ever
        </span>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-slate-900 leading-tight mb-6">
          Learn without limits.<br />
          <span className="text-brand-500">Teach without barriers.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Scholar X is a free online learning platform that connects students and teachers — live classes, recorded lectures, assignments, and more. All in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register?role=student" className="btn-primary text-base px-6 py-3">
            Join as Student
          </Link>
          <Link to="/register?role=teacher" className="btn-secondary text-base px-6 py-3">
            Start Teaching
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-slate-100">
          {[["Free Forever", "No payment required"], ["Live Classes", "Real-time video calls"], ["Any Device", "Works on all screens"]].map(([stat, label]) => (
            <div key={stat} className="text-center">
              <div className="font-display font-bold text-2xl text-slate-900">{stat}</div>
              <div className="text-sm text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-slate-900 mb-3">Everything you need to learn</h2>
            <p className="text-slate-500">Built for real classrooms, designed for the future of education.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>} title="Live Video Classes" desc="Join real-time classes with your teacher. Video, audio, and chat — all built in." />
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>} title="Recorded Lectures" desc="Watch lectures at your own pace. Upload videos or embed from YouTube." />
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} title="Assignments" desc="Teachers post assignments, students submit files. Track progress and grades easily." />
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} title="Announcements" desc="Teachers keep students informed with course announcements that appear in the feed." />
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} title="Course Management" desc="Create courses with a unique code. Students join instantly — no approval needed." />
            <Feature icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>} title="Secure & Private" desc="JWT authentication, role-based access. Your data stays safe and private." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-bold text-3xl text-slate-900 mb-4">Ready to start?</h2>
        <p className="text-slate-500 mb-8">Join thousands of students and teachers on Scholar X. It's completely free.</p>
        <Link to="/register" className="btn-primary text-base px-8 py-3 inline-block">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Scholar X — Free Online Learning Platform
      </footer>
    </div>
  );
}
