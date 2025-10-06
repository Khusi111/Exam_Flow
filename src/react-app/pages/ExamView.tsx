import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft,
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Mail,
  Share2,
  MoreVertical,
  BarChart3,
  FileText,
  Award,
  Hash,
  Zap,
  Building2,
  Globe,
  UserCheck,
  Shield,
  Info,
  ExternalLink,
  Archive
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { api } from '../hooks/useApi';

interface Exam {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  duration_minutes: number;
  max_attempts: number;
  passing_marks: number;
  total_questions: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
  pattern: {
    id: number;
    name: string;
    sections: Array<{
      id: number;
      name: string;
      subject: string;
      start_question: number;
      end_question: number;
      marks_per_question: number;
      question_type: 'mcq' | 'numerical' | 'subjective';
    }>;
  };
  is_published: boolean;
  allow_negative_marking: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_results_immediately: boolean;
  instructions: string;
}

interface ExamStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export default function ExamView() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [exam, setExam] = useState<Exam | null>(null);
  const [stats, setStats] = useState<ExamStats>({
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      console.log('Fetching exam with ID:', examId);
      const response = await api.get<Exam>(`/exams/exams/${examId}/`);
      console.log('Exam data received:', response.data);
      setExam(response.data);
      
      // Try to fetch exam statistics (this endpoint might not exist yet)
      try {
        const statsResponse = await api.get<ExamStats>(`/exams/exams/${examId}/stats/`);
        setStats(statsResponse.data);
      } catch (statsError) {
        // If stats endpoint doesn't exist, use default values
        console.log('Stats endpoint not available, using default values');
        setStats({
          totalAttempts: 0,
          completedAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!exam) return;
    
    try {
      await api.delete(`/exams/exams/${exam.id}/`);
      navigate('/exams');
    } catch (err: any) {
      setError(err.message || 'Failed to delete exam');
    }
  };

  const handleCopy = async () => {
    if (!exam) return;
    
    try {
      const copyData = {
        title: `${exam.title} (Copy)`,
        description: exam.description,
        pattern: exam.pattern?.id,
        start_date: exam.start_date,
        end_date: exam.end_date,
        duration_minutes: exam.duration_minutes,
        max_attempts: exam.max_attempts,
        passing_marks: exam.passing_marks,
        is_published: false,
        allow_negative_marking: exam.allow_negative_marking,
        shuffle_questions: exam.shuffle_questions,
        shuffle_options: exam.shuffle_options,
        show_results_immediately: exam.show_results_immediately,
        instructions: exam.instructions,
        created_by: user?.id,
        institute: user?.institute_id,
      };
      
      const response = await api.post('/exams/exams/', copyData);
      navigate(`/exams/${response.data.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to copy exam');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b6b6b';
      case 'published': return '#216865';
      case 'active': return '#3f5fd4';
      case 'completed': return '#723e11';
      case 'archived': return '#6b6b6b';
      default: return '#6b6b6b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'published': return <CheckCircle className="w-3 h-3" />;
      case 'active': return <Play className="w-3 h-3" />;
      case 'completed': return <Award className="w-3 h-3" />;
      case 'archived': return <Archive className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#216865' }}></div>
          <p className="text-sm" style={{ color: '#6b6b6b' }}>Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h3 className="text-lg font-semibold text-black mb-2">Exam Not Found</h3>
          <p className="text-sm mb-4" style={{ color: '#6b6b6b' }}>
            {error || 'The exam you are looking for does not exist.'}
          </p>
          <Link
            to="/exams"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#216865' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1a524f'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#216865'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/exams')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: '#6b6b6b' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-black">{exam.title}</h1>
              <p className="text-xs" style={{ color: '#6b6b6b' }}>Exam Details & Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getStatusColor(exam.status) }}
            >
              {getStatusIcon(exam.status)}
              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/exams/${exam.id}/edit`)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#3f5fd4' }}
                title="Edit Exam"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#6b6b6b' }}
                title="Copy Exam"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#ef4444' }}
                title="Delete Exam"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Exam Overview */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Exam Overview</h2>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>Basic exam information</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Description</p>
                  <p className="text-xs text-black">{exam.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Pattern</p>
                    <p className="text-xs text-black">{exam.pattern.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Duration</p>
                    <p className="text-xs text-black">{formatDuration(exam.duration_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Total Questions</p>
                    <p className="text-xs text-black">{exam.total_questions}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Total Marks</p>
                    <p className="text-xs text-black">{exam.total_marks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Schedule */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3f5fd4' }}>
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Exam Schedule</h2>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>Timing and availability</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Start Date & Time</p>
                  <p className="text-xs text-black">{formatDate(exam.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>End Date & Time</p>
                  <p className="text-xs text-black">{formatDate(exam.end_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Max Attempts</p>
                  <p className="text-xs text-black">{exam.max_attempts}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>Passing Marks</p>
                  <p className="text-xs text-black">{exam.passing_marks}</p>
                </div>
              </div>
            </div>

            {/* Pattern Structure */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#723e11' }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Pattern Structure</h2>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>Question distribution by subject</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {Object.entries(
                  exam.pattern.sections.reduce((acc: { [key: string]: any[] }, section) => {
                    if (!acc[section.subject]) acc[section.subject] = [];
                    acc[section.subject].push(section);
                    return acc;
                  }, {})
                ).map(([subject, sections]) => (
                  <div key={subject} className="border-l-2 pl-3" style={{ borderColor: '#216865' }}>
                    <p className="text-xs font-semibold text-black mb-2">
                      {subject} ({sections[0].start_question}-{sections[sections.length - 1].end_question})
                    </p>
                    <div className="space-y-1">
                      {sections.map(section => (
                        <div key={section.id} className="flex items-center justify-between text-xs">
                          <span className="text-black">{section.name}</span>
                          <span style={{ color: '#6b6b6b' }}>
                            Q{section.start_question}-{section.end_question} • {section.marks_per_question} marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Settings */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6b6b6b' }}>
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Exam Settings</h2>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>Configuration options</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${exam.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-black">Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${exam.allow_negative_marking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-black">Negative Marking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${exam.shuffle_questions ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-black">Shuffle Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${exam.shuffle_options ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-black">Shuffle Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${exam.show_results_immediately ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-black">Show Results Immediately</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-sm font-semibold text-black mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#6b6b6b' }}>Total Attempts</span>
                  <span className="text-xs font-semibold text-black">{stats.totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#6b6b6b' }}>Completed</span>
                  <span className="text-xs font-semibold text-black">{stats.completedAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#6b6b6b' }}>Average Score</span>
                  <span className="text-xs font-semibold text-black">{stats.averageScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#6b6b6b' }}>Highest Score</span>
                  <span className="text-xs font-semibold text-black">{stats.highestScore}%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-sm font-semibold text-black mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/exams/${exam.id}/edit`)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#3f5fd4' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d4bb8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3f5fd4'}
                >
                  <Edit className="w-3 h-3" />
                  Edit Exam
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#6b6b6b' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a5a5a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b6b6b'}
                >
                  <Copy className="w-3 h-3" />
                  Copy Exam
                </button>
                <button
                  onClick={() => navigate(`/exams/${exam.id}/analytics`)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#723e11' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a2f0d'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#723e11'}
                >
                  <BarChart3 className="w-3 h-3" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Exam Info */}
            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-sm font-semibold text-black mb-3">Exam Info</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" style={{ color: '#6b6b6b' }} />
                  <span style={{ color: '#6b6b6b' }}>Created: {formatDate(exam.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" style={{ color: '#6b6b6b' }} />
                  <span style={{ color: '#6b6b6b' }}>Updated: {formatDate(exam.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" style={{ color: '#6b6b6b' }} />
                  <span style={{ color: '#6b6b6b' }}>ID: {exam.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">Delete Exam</h3>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-xs text-black mb-6">
                Are you sure you want to delete "{exam.title}"? This will permanently remove the exam and all associated data.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 py-2 text-xs border rounded-lg transition-colors hover:bg-gray-100"
                  style={{ borderColor: '#e5e7eb', color: '#6b6b6b' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-xs text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#ef4444' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  Delete Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
