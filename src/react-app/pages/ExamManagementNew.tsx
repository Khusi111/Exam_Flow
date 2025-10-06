import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Users, 
  BarChart3,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Mail,
  Share2
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
      question_type: string;
      start_question: number;
      end_question: number;
      marks_per_question: number;
    }>;
  };
}

export default function ExamManagement() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams/exams/');
      setExams(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      case 'published':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-3 h-3" />;
      case 'published':
        return <CheckCircle className="w-3 h-3" />;
      case 'active':
        return <Play className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'archived':
        return <Pause className="w-3 h-3" />;
      default:
        return <Edit className="w-3 h-3" />;
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getExamStats = () => {
    return {
      total: exams.length,
      draft: exams.filter(e => e.status === 'draft').length,
      published: exams.filter(e => e.status === 'published').length,
      active: exams.filter(e => e.status === 'active').length,
      completed: exams.filter(e => e.status === 'completed').length,
    };
  };

  const stats = getExamStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
            <p className="text-sm text-slate-600">Manage and organize your exams</p>
          </div>
          <Link
            to="/exams/create"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-600">Total</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-600">Draft</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-600">Published</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{stats.published}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-slate-600">Active</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-slate-600">Completed</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{exam.description}</p>
                </div>
                <div className="relative ml-2">
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                  {getStatusIcon(exam.status)}
                  {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">Start</span>
                  </div>
                  <span className="text-slate-900">{new Date(exam.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">Duration</span>
                  </div>
                  <span className="text-slate-900">{exam.duration_minutes} min</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">Questions</span>
                  </div>
                  <span className="text-slate-900">{exam.total_questions}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">Marks</span>
                  </div>
                  <span className="text-slate-900">{exam.total_marks}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/exams/${exam.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Link>
                <Link
                  to={`/exams/${exam.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs bg-slate-50 text-slate-700 rounded hover:bg-slate-100 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Link>
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No exams found</h3>
            <p className="text-sm text-slate-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first exam.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/exams/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Exam
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
