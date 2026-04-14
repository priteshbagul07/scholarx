import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import CoursePage from "./pages/shared/CoursePage";
import LiveClassPage from "./pages/shared/LiveClassPage";
import ProfilePage from "./pages/shared/ProfilePage";
import AppShell from "./components/layout/AppShell";

const Spinner = () => (
  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  if (user?.role === "teacher") return <TeacherDashboard />;
  return <StudentDashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell><DashboardRoute /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <AppShell><CoursePage /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/live/:roomId"
            element={
              <ProtectedRoute>
                <LiveClassPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppShell><ProfilePage /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
