import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  Building2,
  Globe,
  Mail,
  Phone,
  UserCheck,
  Shield,
  Zap
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalStudents: number;
  completedExams: number;
}

interface RecentExam {
  id: number;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  total_questions: number;
  total_marks: number;
}

export default function Dashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    completedExams: 0,
  });

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalExams: 12,
        activeExams: 3,
        totalStudents: 245,
        completedExams: 89,
      });
    }, 1000);
  }, []);

  const recentExams: RecentExam[] = [
    {
      id: 1,
      title: "Mid-term Physics Exam",
      status: "active",
      start_date: "2024-12-15T09:00:00Z",
      end_date: "2024-12-15T12:00:00Z",
      total_questions: 50,
      total_marks: 100,
    },
    {
      id: 2,
      title: "Chemistry Quiz",
      status: "published",
      start_date: "2024-12-20T10:00:00Z",
      end_date: "2024-12-20T11:30:00Z",
      total_questions: 30,
      total_marks: 60,
    },
    {
      id: 3,
      title: "Mathematics Final",
      status: "draft",
      start_date: "2024-12-25T09:00:00Z",
      end_date: "2024-12-25T12:00:00Z",
      total_questions: 80,
      total_marks: 160,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'published':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getQuickActions = () => {
        const baseActions = [
          {
            title: 'Create New Exam',
            description: 'Set up a new examination',
            icon: Plus,
            href: '/exams/create',
            color: 'bg-blue-600 hover:bg-blue-700',
          },
          {
            title: 'Create Pattern',
            description: 'Define exam structure and sections',
            icon: Zap,
            href: '/patterns/create',
            color: 'bg-green-600 hover:bg-green-700',
          },
          {
            title: 'Add Questions',
            description: 'Add questions to question bank',
            icon: BookOpen,
            href: '/questions/create',
            color: 'bg-orange-600 hover:bg-orange-700',
          },
          {
            title: 'View Analytics',
            description: 'Check exam performance',
            icon: BarChart3,
            href: '/analytics',
            color: 'bg-purple-600 hover:bg-purple-700',
          },
        ];

    // Add role-specific actions
    if (user?.role === 'super_admin' || user?.role === 'institute_admin') {
      baseActions.push({
        title: 'Manage Institute',
        description: 'Manage institute settings and users',
        icon: Building2,
        href: '/institute/manage',
        color: 'bg-indigo-600 hover:bg-indigo-700',
      });
    }

    if (user?.role === 'super_admin' || user?.role === 'institute_admin' || user?.role === 'exam_admin') {
      baseActions.push({
        title: 'Manage Users',
        description: 'View and manage users',
        icon: Users,
        href: '/users',
        color: 'bg-orange-600 hover:bg-orange-700',
      });
    }

    if (user?.role === 'super_admin') {
      baseActions.push({
        title: 'Create Institute',
        description: 'Create a new institute',
        icon: Building2,
        href: '/institute/create',
        color: 'bg-teal-600 hover:bg-teal-700',
      });
    }

    return baseActions;
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-black mb-2">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="text-sm" style={{ color: '#6b6b6b' }}>
              Here's what's happening with your exams today.
            </p>
            {user?.institute && (
              <div className="mt-3 flex items-center gap-2" style={{ color: '#6b6b6b' }}>
                <Building2 className="w-4 h-4" />
                <span className="text-sm">
                  {user.institute.name} • {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Institute Information */}
      {user?.institute && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{user.institute.name}</h2>
                <p className="text-sm text-slate-600">Your Institute</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.institute.is_verified ? (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Pending Verification
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Domain</p>
                <p className="text-sm font-medium text-slate-900">{user.institute.domain}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Users</p>
                <p className="text-sm font-medium text-slate-900">{user.institute.user_count}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Active Users</p>
                <p className="text-sm font-medium text-slate-900">{user.institute.active_user_count}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Contact</p>
                <p className="text-sm font-medium text-slate-900">{user.institute.contact_email}</p>
              </div>
            </div>
          </div>
          
          {user.institute.description && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{user.institute.description}</p>
            </div>
          )}
          
          {user.institute.website && (
            <div className="mt-4">
              <a 
                href={user.institute.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            </div>
          )}
        </div>
      )}

      {/* Pending Invitations */}
      {user && !user.institute && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Join an Institute</h3>
              <p className="text-sm text-amber-700">You're not part of any institute yet</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/institute/search"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              <Building2 className="w-4 h-4" />
              Search Institutes
            </Link>
            <Link
              to="/institute/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Institute
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6b6b6b' }}>Total Exams</p>
              <p className="text-lg font-semibold text-black">{stats.totalExams}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6b6b6b' }}>Active Exams</p>
              <p className="text-lg font-semibold text-black">{stats.activeExams}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3f5fd4' }}>
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6b6b6b' }}>Total Students</p>
              <p className="text-lg font-semibold text-black">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#723e11' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#6b6b6b' }}>Completed</p>
              <p className="text-lg font-semibold text-black">{stats.completedExams}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Exams</h2>
                <Link
                  to="/exams"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900">{exam.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(exam.start_date)}
                        </div>
                        <div>{exam.total_questions} questions</div>
                        <div>{exam.total_marks} marks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/exams/${exam.id}`}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {getQuickActions().map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.href}
                      className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{action.title}</h3>
                          <p className="text-sm text-slate-600">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No upcoming events</h3>
            <p className="text-slate-600">Your upcoming exams and deadlines will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
