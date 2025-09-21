'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string,is_admin:boolean, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Checking authentication...');
        console.log('AuthContext: isAuthenticated:', authService.isAuthenticated());
        if (authService.isAuthenticated()) {
          console.log('AuthContext: Getting current user...');
          const currentUser = await authService.getCurrentUser();
          console.log('AuthContext: Current user:', currentUser);
          
          setUser(currentUser);
          setUserRole(currentUser.is_admin ? 'admin' : 'user');
        } else {
          console.log('AuthContext: Not authenticated');
        }
      } catch (error) {
        console.error('AuthContext: Failed to get current user:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Login attempt for:', email);
      const response = await authService.login({ email, password });
      console.log('AuthContext: Login response received');
      
      // Set token
      authService.setToken(response.access_token);
      
      // Verify token was set
      const token = authService.getToken();
      if (!token) {
        throw new Error('Failed to set authentication token');
      }
      
      // Retry mechanism for getting user info
      let currentUser = null;
      let retries = 3;
      
      while (retries > 0 && !currentUser) {
        try {
          console.log(`AuthContext: Getting user info after login... (attempt ${4 - retries})`);
          currentUser = await authService.getCurrentUser();
          console.log('AuthContext: User info received:', currentUser);
          break;
        } catch (error: any) {
          console.log(`AuthContext: Attempt ${4 - retries} failed:`, error.response?.status);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      if (!currentUser) {
        throw new Error('Failed to get user information after login');
      }
      
      setUser(currentUser);
      return { success: true };
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (username: string, email: string,is_admin: boolean, password: string, fullName?: string) => {
    try {
      const response = await authService.signup({ username, email, password,is_admin, full_name: fullName });
      authService.setToken(response.access_token);
      setUser(response.user);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
