import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  User,
  ChevronDown,
  GraduationCap,
  Zap,
  FileText,
  BarChart3,
  Building2
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Exams', href: '/exams', icon: BookOpen },
      // { name: 'Question Bank', href: '/questions', icon: FileText }, // Commented out - questions will be managed within patterns
      { name: 'Patterns', href: '/patterns', icon: Zap },
    ];

    // Add role-specific navigation
    if (user?.role === 'super_admin' || user?.role === 'institute_admin') {
      baseNavigation.push(
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Institute', href: '/institute', icon: Building2 }
      );
    }

    if (user?.role === 'super_admin' || user?.role === 'institute_admin' || user?.role === 'exam_admin') {
      baseNavigation.push({ name: 'Analytics', href: '/analytics', icon: BarChart3 });
    }

    baseNavigation.push({ name: 'Settings', href: '/settings', icon: Settings });

    return baseNavigation;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-black">ExamFlow</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" style={{ color: '#6b6b6b' }} />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {getNavigation().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: isActive(item.href) ? '#216865' : 'transparent',
                    color: isActive(item.href) ? 'white' : '#6b6b6b'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-3 p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#216865' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-black">ExamFlow</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {getNavigation().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: isActive(item.href) ? '#216865' : 'transparent',
                    color: isActive(item.href) ? 'white' : '#6b6b6b'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" style={{ color: '#6b6b6b' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {user?.get_full_name || user?.email}
                </p>
                <p className="text-xs truncate" style={{ color: '#6b6b6b' }}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b h-16" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between px-4 py-3 h-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" style={{ color: '#6b6b6b' }} />
              </button>
              
              <div className="hidden sm:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4" style={{ color: '#6b6b6b' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" style={{ color: '#6b6b6b' }} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" style={{ color: '#6b6b6b' }} />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-black">
                      {user?.get_full_name || user?.email}
                    </p>
                    <p className="text-xs" style={{ color: '#6b6b6b' }}>
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4" style={{ color: '#6b6b6b' }} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50" style={{ borderColor: '#e5e7eb' }}>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      style={{ color: '#6b6b6b' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      style={{ color: '#6b6b6b' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-1" style={{ borderColor: '#e5e7eb' }} />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      style={{ color: '#6b6b6b' }}
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
