"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter, usePathname } from 'next/navigation';

// Define types
interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: Employee) => void;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Logout function (wrapped with useCallback)
  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    deleteCookie('authToken');
    localStorage.removeItem('userInfo');
    router.push('/signin');
  }, [router]);

  // Check if user is authenticated
  useEffect(() => {
    const authToken = getCookie('authToken') as string | undefined;
    
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      
      if (authToken) {
        try {
          const userData = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUser(userData);
          setToken(authToken);

          if (pathname === '/signin' || pathname === '/sign-up' || pathname === '/') {
            router.push('/');
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          handleLogout();
        }
      } else {
        const publicPaths = ['/signin', '/signup', '/reset-password'];
        if (!publicPaths.includes(pathname) && pathname.startsWith('/admin')) {
          router.push('/signin');
        }
      }

      setIsLoading(false);
    }
  }, [pathname, router, handleLogout]); // ✅ handleLogout now has a stable reference

  // Login function
  const login = (newToken: string, userData: Employee) => {
    setToken(newToken);
    setUser(userData);
    console.log('User data:', userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    router.push('/');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
