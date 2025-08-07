/**
 * Clean Google Authentication Service
 *
 * Simplified Google OAuth authentication with development mode fallback
 */

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  verified_email?: boolean;
}

export interface GoogleAuthResponse {
  user: GoogleUser;
  token: string;
  googleCredential?: string;
  success: boolean;
  message?: string;
}

class GoogleAuthService {
  private static instance: GoogleAuthService;

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Decode JWT token to extract user information
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Handle successful Google login response
   */
  public async handleGoogleSuccess(credentialResponse: any): Promise<GoogleAuthResponse> {
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user information
      const userInfo = this.decodeJWT(credentialResponse.credential);
      
      if (!userInfo) {
        throw new Error('Failed to decode user information');
      }

      // Create user object
      const user: GoogleUser = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        verified_email: userInfo.email_verified,
      };

      // Store authentication data
      const authToken = `google_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('googleCredential', credentialResponse.credential);
      localStorage.setItem('lastLoginTime', Date.now().toString());
      localStorage.setItem('loginMethod', 'google');

      return {
        user,
        token: authToken,
        googleCredential: credentialResponse.credential,
        success: true,
        message: 'Google login successful'
      };
    } catch (error: any) {
      console.error('Google login error:', error);

      // Development mode fallback - create a mock Google user for testing
      if (import.meta.env.DEV) {
        console.warn('Google auth failed, using development mode fallback');
        const mockUser: GoogleUser = {
          id: 'dev_user_' + Date.now(),
          email: 'developer@example.com',
          name: 'Development User',
          picture: 'https://via.placeholder.com/150',
          given_name: 'Development',
          family_name: 'User',
          verified_email: true
        };

        const authToken = `google_dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userProfile', JSON.stringify(mockUser));
        localStorage.setItem('lastLoginTime', Date.now().toString());
        localStorage.setItem('loginMethod', 'google_dev');

        return {
          user: mockUser,
          token: authToken,
          success: true,
          message: 'Development mode: Mock Google login successful'
        };
      }

      return {
        user: {} as GoogleUser,
        token: '',
        success: false,
        message: error.message || 'Google login failed'
      };
    }
  }

  /**
   * Handle Google login error
   */
  public handleGoogleError(error: any): void {
    console.error('Google login error:', error);
    
    // Clear any existing auth data
    this.logout();
    
    // You can add more specific error handling here
    throw new Error('Google authentication failed. Please try again.');
  }

  /**
   * Check if user is authenticated with Google
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const userProfile = localStorage.getItem('userProfile');
    const loginMethod = localStorage.getItem('loginMethod');
    
    return !!(token && userProfile && loginMethod === 'google');
  }

  /**
   * Get current user profile
   */
  public getCurrentUser(): GoogleUser | null {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        return JSON.parse(userProfile);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout user and clear authentication data
   */
  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('googleCredential');
    localStorage.removeItem('loginMethod');
    
    // Keep lastLoginTime for user convenience
    // localStorage.removeItem('lastLoginTime');
  }

  /**
   * Get authentication token
   */
  public getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Refresh authentication (if needed)
   */
  public async refreshAuth(): Promise<boolean> {
    try {
      // In a real application, you might want to validate the token with your backend
      // or refresh it if it's expired
      const token = this.getAuthToken();
      const user = this.getCurrentUser();
      
      if (token && user) {
        // Token is still valid
        return true;
      }
      
      // Token is invalid, logout user
      this.logout();
      return false;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Send user data to backend
   */
  public async syncWithBackend(user: GoogleUser, googleCredential: string): Promise<boolean> {
    try {
      // Send the user data to your backend for registration/login
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: googleCredential,
          user: user,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Store the backend JWT token
          localStorage.setItem('backendToken', data.token);

          // Update user profile with backend data if needed
          if (data.user) {
            localStorage.setItem('userProfile', JSON.stringify(data.user));
          }

          console.log('Successfully synced with backend:', data.message);
          return true;
        } else {
          console.error('Backend sync failed:', data.message);
          return false;
        }
      } else {
        console.error('Backend sync failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error syncing with backend:', error);
      // Don't fail the login if backend sync fails in development
      return true;
    }
  }
}

// Export singleton instance
export const googleAuthService = GoogleAuthService.getInstance();
export default googleAuthService;
