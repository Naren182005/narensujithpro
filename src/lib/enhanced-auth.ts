/**
 * Enhanced Authentication Service
 * 
 * This service handles authentication with both database and localStorage fallback.
 * It provides complete authentication features including password reset.
 */

import { toast } from '@/components/ui/sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  loginMethod: 'email' | 'google';
  createdAt: string;
  lastLogin?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private readonly API_BASE = 'http://localhost:3001/api';
  private readonly USERS_KEY = 'temp_users';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly AUTH_TOKEN_KEY = 'authToken';
  private useDatabaseFallback = true;

  private constructor() {}

  public static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  /**
   * Check if backend is available
   */
  private async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/health`, {
        method: 'GET',
        timeout: 3000
      } as any);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate an auth token
   */
  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Hash password (simple implementation for demo)
   */
  private hashPassword(password: string): string {
    // In production, use proper bcrypt hashing
    return btoa(password + 'salt_key_2024');
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  /**
   * Get users from localStorage
   */
  private getLocalUsers(): any[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save users to localStorage
   */
  private saveLocalUsers(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  /**
   * Register a new user
   */
  public async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user data
          localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data.user));
          localStorage.setItem('userProfile', JSON.stringify(data.user));

          return {
            success: true,
            user: data.user,
            token: data.token,
            message: 'Registration successful!'
          };
        } else {
          throw new Error(data.error || 'Registration failed');
        }
      }

      // Fallback to localStorage
      const users = this.getLocalUsers();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Create new user
      const newUser: User = {
        id: this.generateUserId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        loginMethod: 'email',
        createdAt: new Date().toISOString(),
        emailVerified: false
      };

      // Store password separately (hashed)
      const userWithPassword = {
        ...newUser,
        password: this.hashPassword(password)
      };

      users.push(userWithPassword);
      this.saveLocalUsers(users);

      // Generate token and set current user
      const token = this.generateToken();
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem('userProfile', JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        token,
        message: 'Registration successful!'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login with email and password
   */
  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user data
          localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data.user));
          localStorage.setItem('userProfile', JSON.stringify(data.user));
          localStorage.setItem('lastLoginTime', Date.now().toString());

          return {
            success: true,
            user: data.user,
            token: data.token,
            message: 'Login successful!'
          };
        } else {
          throw new Error(data.error || 'Login failed');
        }
      }

      // Fallback to localStorage
      const users = this.getLocalUsers();
      
      // Find user by email
      const user = users.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.loginMethod === 'email'
      );

      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address'
        };
      }

      // Verify password
      if (!this.verifyPassword(password, user.password)) {
        return {
          success: false,
          message: 'Invalid password'
        };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.saveLocalUsers(users);

      // Generate token and set current user
      const token = this.generateToken();
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem('userProfile', JSON.stringify(userWithoutPassword));
      localStorage.setItem('lastLoginTime', Date.now().toString());

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful!'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Change password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'No user logged in'
        };
      }

      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(this.AUTH_TOKEN_KEY)}`
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          return {
            success: true,
            message: 'Password changed successfully!'
          };
        } else {
          throw new Error(data.error || 'Password change failed');
        }
      }

      // Fallback to localStorage
      const users = this.getLocalUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      if (!this.verifyPassword(currentPassword, users[userIndex].password)) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Update password
      users[userIndex].password = this.hashPassword(newPassword);
      this.saveLocalUsers(users);

      return {
        success: true,
        message: 'Password changed successfully!'
      };
    } catch (error: any) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          return {
            success: true,
            message: 'Password reset email sent! Check your inbox.'
          };
        } else {
          throw new Error(data.error || 'Password reset failed');
        }
      }

      // Fallback to localStorage (simulate email)
      const users = this.getLocalUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address'
        };
      }

      // Generate reset token and store it
      const resetToken = this.generateToken();
      const resetData = {
        email,
        token: resetToken,
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      };
      
      localStorage.setItem('passwordResetToken', JSON.stringify(resetData));

      // In a real app, you'd send an email here
      toast.info(`Password reset link: /reset-password?token=${resetToken}`, {
        duration: 10000
      });

      return {
        success: true,
        message: 'Password reset instructions sent! (Check the toast notification for demo link)'
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }

  /**
   * Reset password with token
   */
  public async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          return {
            success: true,
            message: 'Password reset successfully!'
          };
        } else {
          throw new Error(data.error || 'Password reset failed');
        }
      }

      // Fallback to localStorage
      const resetDataStr = localStorage.getItem('passwordResetToken');
      if (!resetDataStr) {
        return {
          success: false,
          message: 'Invalid or expired reset token'
        };
      }

      const resetData = JSON.parse(resetDataStr);
      
      if (resetData.token !== token || Date.now() > resetData.expires) {
        localStorage.removeItem('passwordResetToken');
        return {
          success: false,
          message: 'Invalid or expired reset token'
        };
      }

      // Update user password
      const users = this.getLocalUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === resetData.email.toLowerCase());
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      users[userIndex].password = this.hashPassword(newPassword);
      this.saveLocalUsers(users);
      
      // Clean up reset token
      localStorage.removeItem('passwordResetToken');

      return {
        success: true,
        message: 'Password reset successfully!'
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Google authentication
   */
  public async googleAuth(googleUser: any): Promise<AuthResponse> {
    try {
      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleToken: 'mock_token',
            user: googleUser
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data.user));
          localStorage.setItem('userProfile', JSON.stringify(data.user));
          localStorage.setItem('lastLoginTime', Date.now().toString());
          localStorage.setItem('loginMethod', 'google');

          return {
            success: true,
            user: data.user,
            token: data.token,
            message: 'Google authentication successful!'
          };
        }
      }

      // Fallback to localStorage
      const users = this.getLocalUsers();
      
      // Check if user already exists
      let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
      
      if (user) {
        // Update existing user with Google info
        user.picture = googleUser.picture;
        user.loginMethod = 'google';
        user.lastLogin = new Date().toISOString();
      } else {
        // Create new user
        user = {
          id: this.generateUserId(),
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          picture: googleUser.picture,
          loginMethod: 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true
        };
        users.push(user);
      }

      // Save updated users
      this.saveLocalUsers(users);

      // Generate token and set current user
      const token = this.generateToken();
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem('userProfile', JSON.stringify(userWithoutPassword));
      localStorage.setItem('lastLoginTime', Date.now().toString());
      localStorage.setItem('loginMethod', 'google');

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Google authentication successful!'
      };
    } catch (error: any) {
      console.error('Google auth error:', error);
      return {
        success: false,
        message: error.message || 'Google authentication failed'
      };
    }
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Update user profile
   */
  public async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'No user logged in'
        };
      }

      // Try backend first
      if (this.useDatabaseFallback && await this.isBackendAvailable()) {
        const response = await fetch(`${this.API_BASE}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(this.AUTH_TOKEN_KEY)}`
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data.user));
          localStorage.setItem('userProfile', JSON.stringify(data.user));

          return {
            success: true,
            user: data.user,
            message: 'Profile updated successfully!'
          };
        }
      }

      // Fallback to localStorage
      const users = this.getLocalUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      
      // Save changes
      this.saveLocalUsers(users);
      const userWithoutPassword = { ...updatedUser };
      delete userWithoutPassword.password;
      
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem('userProfile', JSON.stringify(userWithoutPassword));

      return {
        success: true,
        user: userWithoutPassword,
        message: 'Profile updated successfully!'
      };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Logout user
   */
  public logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('loginMethod');
    localStorage.removeItem('lastLoginTime');
    console.log('User logged out');
  }
}

// Export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance();
export default enhancedAuthService;
