/**
 * Temporary Authentication Service
 * 
 * This service handles authentication with localStorage until database is connected.
 * It provides email/password login, registration, and Google OAuth integration.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  loginMethod: 'email' | 'google';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class TempAuthService {
  private static instance: TempAuthService;
  private readonly USERS_KEY = 'temp_users';
  private readonly CURRENT_USER_KEY = 'current_user';
  private readonly AUTH_TOKEN_KEY = 'authToken';

  private constructor() {}

  public static getInstance(): TempAuthService {
    if (!TempAuthService.instance) {
      TempAuthService.instance = new TempAuthService();
    }
    return TempAuthService.instance;
  }

  /**
   * Get all users from localStorage
   */
  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
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
   * Register a new user with email and password
   */
  public async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const users = this.getUsers();
      
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
        createdAt: new Date().toISOString()
      };

      // Add to users array
      users.push(newUser);
      this.saveUsers(users);

      // Generate token and set current user
      const token = this.generateToken();
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem('userProfile', JSON.stringify(newUser));

      console.log('User registered successfully:', newUser);

      return {
        success: true,
        user: newUser,
        token,
        message: 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login with email and password
   */
  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const users = this.getUsers();
      
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

      // In a real app, you'd verify the password hash
      // For temporary storage, we'll just check if user exists
      
      // Generate token and set current user
      const token = this.generateToken();
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('lastLoginTime', Date.now().toString());

      console.log('User logged in successfully:', user);

      return {
        success: true,
        user,
        token,
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Login/Register with Google
   */
  public async googleAuth(googleUser: any): Promise<AuthResponse> {
    try {
      const users = this.getUsers();
      
      // Check if user already exists
      let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
      
      if (user) {
        // Update existing user with Google info
        user.picture = googleUser.picture;
        user.loginMethod = 'google';
      } else {
        // Create new user
        user = {
          id: this.generateUserId(),
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          picture: googleUser.picture,
          loginMethod: 'google',
          createdAt: new Date().toISOString()
        };
        users.push(user);
      }

      // Save updated users
      this.saveUsers(users);

      // Generate token and set current user
      const token = this.generateToken();
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('lastLoginTime', Date.now().toString());
      localStorage.setItem('loginMethod', 'google');

      console.log('Google auth successful:', user);

      return {
        success: true,
        user,
        token,
        message: 'Google authentication successful!'
      };
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        message: 'Google authentication failed. Please try again.'
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
   * Logout user
   */
  public logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('loginMethod');
    console.log('User logged out');
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

      const users = this.getUsers();
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
      this.saveUsers(users);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Failed to update profile'
      };
    }
  }
}

// Export singleton instance
export const tempAuthService = TempAuthService.getInstance();
export default tempAuthService;
