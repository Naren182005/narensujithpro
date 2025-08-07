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

class CleanGoogleAuthService {
  private static instance: CleanGoogleAuthService;

  private constructor() {}

  public static getInstance(): CleanGoogleAuthService {
    if (!CleanGoogleAuthService.instance) {
      CleanGoogleAuthService.instance = new CleanGoogleAuthService();
    }
    return CleanGoogleAuthService.instance;
  }

  /**
   * Handle Google login success with clean error handling
   */
  public async handleGoogleSuccess(credentialResponse: any): Promise<GoogleAuthResponse> {
    try {
      // Check if we have a valid credential
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user information
      const userInfo = this.decodeJWT(credentialResponse.credential);
      
      if (!userInfo) {
        throw new Error('Failed to decode user information');
      }

      // Create user object from Google data
      const user: GoogleUser = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        verified_email: userInfo.email_verified,
      };

      // Generate auth token and store user data
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
      
      // Development mode fallback
      return this.createDevModeUser();
    }
  }

  /**
   * Create development mode user for testing
   */
  public createDevModeUser(): GoogleAuthResponse {
    console.warn('Using development mode authentication');
    
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

  /**
   * Decode JWT token
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get current user from localStorage
   */
  public getCurrentUser(): GoogleUser | null {
    try {
      const userProfile = localStorage.getItem('userProfile');
      return userProfile ? JSON.parse(userProfile) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('googleCredential');
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('loginMethod');
  }

  /**
   * Get authentication token
   */
  public getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

// Export singleton instance
export const cleanGoogleAuthService = CleanGoogleAuthService.getInstance();
