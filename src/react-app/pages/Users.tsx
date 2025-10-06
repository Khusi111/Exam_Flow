import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Users as UsersIcon, 
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  GraduationCap,
  Settings,
  Ban,
  UserCheck
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { api } from '../hooks/useApi';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'institute_admin' | 'exam_admin' | 'teacher' | 'student';
  is_active: boolean;
  is_verified: boolean;
  last_login: string;
  created_at: string;
  institute: {
    id: number;
    name: string;
  };
  phone_number?: string;
}

export default function Users() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'institute_admin':
        return 'bg-purple-100 text-purple-700';
      case 'exam_admin':
        return 'bg-blue-100 text-blue-700';
      case 'teacher':
        return 'bg-green-100 text-green-700';
      case 'student':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-3 h-3" />;
      case 'institute_admin':
        return <Building2 className="w-3 h-3" />;
      case 'exam_admin':
        return <Settings className="w-3 h-3" />;
      case 'teacher':
        return <GraduationCap className="w-3 h-3" />;
      case 'student':
        return <UsersIcon className="w-3 h-3" />;
      default:
        return <UsersIcon className="w-3 h-3" />;
    }
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = 
      userData.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && userData.is_active) ||
                         (statusFilter === 'inactive' && !userData.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      verified: users.filter(u => u.is_verified).length,
      unverified: users.filter(u => !u.is_verified).length,
    };
  };

  const getRoleStats = () => {
    return {
      super_admin: users.filter(u => u.role === 'super_admin').length,
      institute_admin: users.filter(u => u.role === 'institute_admin').length,
      exam_admin: users.filter(u => u.role === 'exam_admin').length,
      teacher: users.filter(u => u.role === 'teacher').length,
      student: users.filter(u => u.role === 'student').length,
    };
  };

  const stats = getUserStats();
  const roleStats = getRoleStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-black">User Management</h1>
            <p className="text-sm" style={{ color: '#6b6b6b' }}>Manage users and their permissions</p>
          </div>
          <button 
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#216865' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1a524f'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#216865'}
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" style={{ color: '#216865' }} />
              <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Total</span>
            </div>
            <div className="text-lg font-semibold text-black mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: '#216865' }} />
              <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Active</span>
            </div>
            <div className="text-lg font-semibold text-black mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: '#6b6b6b' }} />
              <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Inactive</span>
            </div>
            <div className="text-lg font-semibold text-black mt-1">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" style={{ color: '#3f5fd4' }} />
              <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Verified</span>
            </div>
            <div className="text-lg font-semibold text-black mt-1">{stats.verified}</div>
          </div>
          <div className="bg-white rounded-lg border p-3" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#723e11' }} />
              <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Pending</span>
            </div>
            <div className="text-lg font-semibold text-black mt-1">{stats.unverified}</div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-lg border p-4 mb-6" style={{ borderColor: '#e5e7eb' }}>
          <h3 className="text-sm font-semibold text-black mb-3">Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#216865' }}>{roleStats.super_admin}</div>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>Super Admin</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#3f5fd4' }}>{roleStats.institute_admin}</div>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>Institute Admin</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#723e11' }}>{roleStats.exam_admin}</div>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>Exam Admin</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#216865' }}>{roleStats.teacher}</div>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#3f5fd4' }}>{roleStats.student}</div>
              <div className="text-xs" style={{ color: '#6b6b6b' }}>Students</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4" style={{ color: '#6b6b6b' }} />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                style={{ 
                  borderColor: '#e5e7eb',
                  color: '#000000'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3f5fd4';
                  e.target.style.ringColor = '#3f5fd4';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters ? 'text-white' : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: showFilters ? '#216865' : 'white',
                borderColor: '#e5e7eb',
                color: showFilters ? 'white' : '#6b6b6b'
              }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="ml-2 px-2 py-1 text-xs border rounded focus:ring-1 focus:outline-none"
                    style={{ 
                      borderColor: '#e5e7eb',
                      color: '#000000'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3f5fd4';
                      e.target.style.ringColor = '#3f5fd4';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="institute_admin">Institute Admin</option>
                    <option value="exam_admin">Exam Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <span className="text-xs font-medium" style={{ color: '#6b6b6b' }}>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="ml-2 px-2 py-1 text-xs border rounded focus:ring-1 focus:outline-none"
                    style={{ 
                      borderColor: '#e5e7eb',
                      color: '#000000'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3f5fd4';
                      e.target.style.ringColor = '#3f5fd4';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>Institute</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b6b6b' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-4 h-4" style={{ color: '#6b6b6b' }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">
                            {userData.first_name} {userData.last_name}
                          </div>
                          <div className="text-xs" style={{ color: '#6b6b6b' }}>{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white`}
                      style={{
                        backgroundColor: userData.role === 'super_admin' ? '#216865' :
                        userData.role === 'institute_admin' ? '#3f5fd4' :
                        userData.role === 'exam_admin' ? '#723e11' :
                        userData.role === 'teacher' ? '#216865' :
                        '#3f5fd4'
                      }}>
                        {getRoleIcon(userData.role)}
                        {userData.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-black">{userData.institute?.name || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white`}
                        style={{
                          backgroundColor: userData.is_active ? '#216865' : '#6b6b6b'
                        }}>
                          {userData.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {userData.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {!userData.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: '#723e11' }}>
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-black">
                        {userData.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded transition-colors hover:bg-gray-200" style={{ color: '#3f5fd4' }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded transition-colors hover:bg-gray-200" style={{ color: '#6b6b6b' }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded transition-colors hover:bg-gray-200" style={{ color: '#6b6b6b' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-200" style={{ color: '#6b6b6b' }}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 mx-auto mb-4" style={{ color: '#6b6b6b' }} />
            <h3 className="text-lg font-medium text-black mb-2">No users found</h3>
            <p className="text-sm mb-4" style={{ color: '#6b6b6b' }}>
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.' 
                : 'No users have been added yet.'}
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#216865' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1a524f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#216865'}
              >
                <UserPlus className="w-4 h-4" />
                Invite User
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
