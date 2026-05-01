import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth
import Auth from "../pages/auth/Auth";

// Student
import StudentDashboard from "../pages/student/StudentDashboard";
import MyTeam from "../pages/student/MyTeam";
import MLScore from "../pages/student/MLScore";
import GrowthSuggestions from "../pages/student/GrowthSuggestions";
import CheckCompatibility from "../pages/student/CheckCompatibility";
import ProfileUpdate from "../pages/student/ProfileUpdate";

// Teacher
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import StudentsList from "../pages/teacher/StudentsList";
import GenerateTeams from "../pages/teacher/GenerateTeams";
import TeamsHistory from "../pages/teacher/TeamsHistory";
import TeamDetail from "../pages/teacher/TeamDetail";
import SubmitFeedback from "../pages/teacher/SubmitFeedback";
import ModelAccuracy from "../pages/teacher/ModelAccuracy";
import CompatibilityChecker from "../pages/teacher/CompatibilityChecker";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import ModelMonitoring from "../pages/admin/ModelMonitoring";

function ProtectedRoute({ children, allowedRole }) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole)
    return <Navigate to={`/${role}`} replace />;

  return children;
}

export default function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  // ✅ Token exists but role not yet in localStorage — clear and re-login
  if (isLoggedIn && !role) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          isLoggedIn && role ? <Navigate to={`/${role}`} replace /> : <Auth />
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/team"
        element={
          <ProtectedRoute allowedRole="student">
            <MyTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/ml-score"
        element={
          <ProtectedRoute allowedRole="student">
            <MLScore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/growth"
        element={
          <ProtectedRoute allowedRole="student">
            <GrowthSuggestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/compatibility"
        element={
          <ProtectedRoute allowedRole="student">
            <CheckCompatibility />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <ProfileUpdate />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute allowedRole="teacher">
            <StudentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/generate"
        element={
          <ProtectedRoute allowedRole="teacher">
            <GenerateTeams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/teams"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeamsHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/teams/:id"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeamDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/feedback"
        element={
          <ProtectedRoute allowedRole="teacher">
            <SubmitFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/model-accuracy"
        element={
          <ProtectedRoute allowedRole="teacher">
            <ModelAccuracy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/compatibility"
        element={
          <ProtectedRoute allowedRole="teacher">
            <CompatibilityChecker />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/model"
        element={
          <ProtectedRoute allowedRole="admin">
            <ModelMonitoring />
          </ProtectedRoute>
        }
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
