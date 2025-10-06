import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuthContext } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import Login from "@/react-app/pages/Login";
import Register from "@/react-app/pages/Register";
import Dashboard from "@/react-app/pages/Dashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import ExamSetupDetails from "@/react-app/pages/ExamSetupDetails";
import EnhancedQuestionEditor from "@/react-app/pages/EnhancedQuestionEditor";
import StudentExamView from "@/react-app/pages/StudentExamView";
import ExamCreation from "@/react-app/pages/ExamCreation";
import ExamManagement from "@/react-app/pages/ExamManagement";
import ExamView from "@/react-app/pages/ExamView";
import PatternManagement from "@/react-app/pages/PatternManagement";
import PatternCreation from "@/react-app/pages/PatternCreation";
import QuestionBank from "@/react-app/pages/QuestionBank";
import QuestionCreation from "@/react-app/pages/QuestionCreation";
import Users from "@/react-app/pages/Users";
import Analytics from "@/react-app/pages/Analytics";
import Settings from "@/react-app/pages/Settings";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

// Public Route Component (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
          <Route path="/exams" element={
            <ProtectedRoute>
              <ExamManagement />
            </ProtectedRoute>
          } />
          <Route path="/exams/create" element={
            <ProtectedRoute>
              <ExamCreation />
            </ProtectedRoute>
          } />
          <Route path="/exams/:examId" element={
            <ProtectedRoute>
              <ExamView />
            </ProtectedRoute>
          } />
          <Route path="/exams/:examId/edit" element={
            <ProtectedRoute>
              <ExamCreation />
            </ProtectedRoute>
          } />
          <Route path="/exams/:examId/setup" element={
            <ProtectedRoute>
              <ExamSetupDetails />
            </ProtectedRoute>
          } />
          <Route path="/exams/:examId/question/:questionNumber" element={
            <ProtectedRoute>
              <EnhancedQuestionEditor />
            </ProtectedRoute>
          } />
          <Route path="/exam-view/:examId" element={
            <ProtectedRoute>
              <StudentExamView />
            </ProtectedRoute>
          } />
          <Route path="/patterns" element={
            <ProtectedRoute>
              <PatternManagement />
            </ProtectedRoute>
          } />
          <Route path="/patterns/create" element={
            <ProtectedRoute>
              <PatternCreation />
            </ProtectedRoute>
          } />
          <Route path="/patterns/:id/edit" element={
            <ProtectedRoute>
              <PatternCreation />
            </ProtectedRoute>
          } />
          <Route path="/patterns/:patternId/questions/create" element={
            <ProtectedRoute>
              <QuestionCreation />
            </ProtectedRoute>
          } />
          <Route path="/patterns/:patternId/sections/:sectionId/questions/create" element={
            <ProtectedRoute>
              <QuestionCreation />
            </ProtectedRoute>
          } />
          <Route path="/questions" element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          } />
          <Route path="/questions/create" element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
