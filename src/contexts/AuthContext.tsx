/**
 * Authentication Context
 * 
 * This context provides authentication state and methods throughout the app.
 * It handles both Google OAuth and traditional email/password authentication.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleAuthService, GoogleUser } from '@/lib/google-auth';

interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: GoogleUser) => void;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const isAuth = googleAuthService.isAuthenticated();
        
        if (isAuth) {
          const currentUser = googleAuthService.getCurrentUser();
          
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Optionally refresh authentication with backend
            await googleAuthService.refreshAuth();
          } else {
            // Clear invalid auth state
            googleAuthService.logout();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        googleAuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: GoogleUser) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    googleAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const success = await googleAuthService.refreshAuth();
      
      if (!success) {
        logout();
        return false;
      }
      
      // Update user data if needed
      const currentUser = googleAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
