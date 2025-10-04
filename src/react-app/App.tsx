import { BrowserRouter as Router, Routes, Route } from "react-router";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import ExamSetupDetails from "@/react-app/pages/ExamSetupDetails";
import EnhancedQuestionEditor from "@/react-app/pages/EnhancedQuestionEditor";
import StudentExamView from "@/react-app/pages/StudentExamView";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/exam/:examId" element={<ExamSetupDetails />} />
          <Route path="/exam/:examId/question/:questionNumber" element={<EnhancedQuestionEditor />} />
          <Route path="/exam-view/:examId" element={<StudentExamView />} />
        </Routes>
      </div>
    </Router>
  );
}
