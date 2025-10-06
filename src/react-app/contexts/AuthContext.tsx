import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/react-app/hooks/useApi';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  email: string;
  role: 'super_admin' | 'institute_admin' | 'exam_admin' | 'teacher' | 'student';
  institute_id?: number;
  institute_name?: string;
  first_name?: string;
  last_name?: string;
  get_full_name?: string;
  // Add other user-related fields as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, institute_domain: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: User['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromTokens = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const decodedToken: any = jwtDecode(accessToken);
          // You might want to add a token validation check here (e.g., expiration)
          setUser({
            id: decodedToken.user_id,
            email: decodedToken.email,
            role: decodedToken.role,
            institute_id: decodedToken.institute_id,
            institute_name: decodedToken.institute_name,
            first_name: decodedToken.first_name,
            last_name: decodedToken.last_name,
            get_full_name: `${decodedToken.first_name || ''} ${decodedToken.last_name || ''}`.trim(),
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to decode access token:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUserFromTokens();
  }, []);

  const login = async (email: string, password: string, institute_domain?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error("Login failed:", error);
      logout(); // Ensure no stale tokens/user data
      setLoading(false);
      throw error; // Re-throw to be handled by the component
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to clear server-side session
      await api.post('/auth/logout/');
    } catch (error) {
      // Even if backend logout fails, continue with frontend cleanup
      console.log('Backend logout failed, continuing with frontend cleanup');
    }
    
    // Clear all frontend storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear(); // Clear any other stored data
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const userRole = user ? user.role : null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};