// ============================================================
// Auth Context - JWT Token & Role Management
// Provides authentication state across the application
// ============================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getStoredUser, removeToken, getToken } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'doctor' | 'pharmacist' | 'admin';
  universityId?: string;
  department?: string;
  bloodGroup?: string;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendOnline: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  mockLogin: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for when backend is offline (development/demo)
const MOCK_USERS: Record<string, User> = {
  student: {
    id: 'mock-student-001',
    name: 'K. M. Shafayat Shapnil',
    email: 'shapnil@university.edu',
    role: 'student',
    universityId: '08123202051001',
    department: 'Computer Science',
    isApproved: true
  },
  doctor: {
    id: 'mock-doctor-001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'doctor',
    department: 'General Medicine',
    isApproved: true
  },
  pharmacist: {
    id: 'mock-pharmacist-001',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@university.edu',
    role: 'pharmacist',
    department: 'Pharmacy',
    isApproved: true
  },
  admin: {
    id: 'mock-admin-001',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Administration',
    isApproved: true
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();

    if (storedUser && token) {
      setUser(storedUser);
      // Verify token is still valid
      authAPI.getProfile()
        .then(() => setBackendOnline(true))
        .catch((err) => {
          if (err.message !== 'BACKEND_OFFLINE') {
            // Token expired, clear session
            removeToken();
            setUser(null);
          }
        });
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        setUser(data.data.user);
        setBackendOnline(true);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error: any) {
      if (error.message === 'BACKEND_OFFLINE') {
        setBackendOnline(false);
        return { success: false, error: 'Backend is offline. Use demo mode or start the backend server.' };
      }
      return { success: false, error: error.message };
    }
  };

  const register = async (userData: any) => {
    try {
      const data = await authAPI.register(userData);
      if (data.success) {
        setUser(data.data.user);
        setBackendOnline(true);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error: any) {
      if (error.message === 'BACKEND_OFFLINE') {
        setBackendOnline(false);
        return { success: false, error: 'Backend is offline. Start the backend server to register.' };
      }
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const mockLogin = (role: string) => {
    const mockUser = MOCK_USERS[role];
    if (mockUser) {
      setUser(mockUser);
      setBackendOnline(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      backendOnline,
      login,
      register,
      logout,
      mockLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
