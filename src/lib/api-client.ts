import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '@/config';
import { handleApiError, ErrorCategory, ErrorSeverity, createError } from './error-handler';

/**
 * API Client
 *
 * A centralized API client for making HTTP requests to the backend.
 * Includes interceptors for authentication, error handling, and logging.
 */

// Create axios instance with configuration from the config file
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common response patterns and errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      // Clear auth token if it's expired or invalid
      localStorage.removeItem('authToken');

      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }

    // Handle the error using our centralized error handler
    handleApiError(error);

    return Promise.reject(error);
  }
);

/**
 * Authentication API
 *
 * Handles user authentication, registration, and session management.
 */
export const auth = {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Registration response with user data and token
   */
  register: async (userData: { email: string; password: string; name?: string }) => {
    try {
      const response = await api.post('/users/register', userData);

      // If registration is successful, store the token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      // Let the interceptor handle the error
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param credentials User login credentials
   * @returns Login response with user data and token
   */
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/users/login', credentials);

      // If login is successful, store the token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      // Let the interceptor handle the error
      throw error;
    }
  },

  /**
   * Direct login without 2FA (for development)
   * @param credentials User login credentials
   * @returns Login response with user data and token
   */
  directLogin: async (credentials: { email: string; password: string }) => {
    try {
      // For development, use a mock implementation instead of making an API call
      console.log('Using mock login implementation');

      // Validate credentials
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a fake token
      const token = `demo_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      // Return mock response
      return {
        success: true,
        token,
        user: {
          id: '123456',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'user'
        }
      };
    } catch (error) {
      // Let the interceptor handle the error
      throw error;
    }
  },

  /**
   * Verify login with confirmation code (for 2FA)
   * @param data Email and verification code
   * @returns Verification response with user data and token
   */
  verifyLogin: async (data: { email: string; code: string }) => {
    try {
      const response = await api.post('/users/verify-login', data);

      // If login is successful, store the token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      return response.data;
    } catch (error) {
      // Let the interceptor handle the error
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns Logout response
   */
  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      // Even if the API call fails, we should still remove the token
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  /**
   * Logout from all devices
   * @returns Logout response
   */
  logoutAll: async () => {
    try {
      const response = await api.post('/users/logout-all');
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      // Even if the API call fails, we should still remove the token
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  /**
   * Request password reset
   * @param email User email address
   * @returns Password reset request response
   */
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('/users/request-password-reset', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with confirmation code
   * @param data Email, code, and new password
   * @returns Password reset response
   */
  resetPassword: async (data: { email: string; code: string; newPassword: string }) => {
    try {
      const response = await api.post('/users/reset-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Social Accounts API
 *
 * Handles connecting, managing, and authenticating with social media platforms.
 */
export const socialAccounts = {
  /**
   * Get all connected social media accounts
   * @returns List of connected accounts
   */
  getAll: async () => {
    try {
      const response = await api.get('/social-accounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send confirmation code for social account connection
   * @param data Email and platform information
   * @returns Confirmation code response
   */
  sendConfirmationCode: async (data: { email: string; platform: string }) => {
    try {
      const response = await api.post('/social-accounts/send-confirmation', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Connect a social media account
   * @param platform Platform name
   * @param accountData Account credentials and confirmation code
   * @returns Connected account data
   */
  connect: async (platform: string, accountData: {
    username: string;
    accountId: string;
    password: string;
    email: string;
    confirmationCode: string;
  }) => {
    try {
      const response = await api.post(`/social-accounts/connect/${platform}`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Disconnect a social media account
   * @param platform Platform name
   * @param accountId ID of the account to disconnect
   * @returns Success response
   */
  disconnect: async (platform: string, accountId: string) => {
    try {
      const response = await api.delete(`/social-accounts/disconnect/${platform}/${accountId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a social media account
   * @param platform Platform name
   * @param accountId ID of the account to update
   * @param updates Updated account information
   * @returns Updated account data
   */
  update: async (platform: string, accountId: string, updates: {
    username?: string;
    password?: string;
    email?: string;
  }) => {
    try {
      const response = await api.patch(`/social-accounts/update/${platform}/${accountId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify updated social media account email
   * @param platform Platform name
   * @param accountId ID of the account to verify
   * @param confirmationCode Confirmation code sent to email
   * @returns Verification result
   */
  verifyUpdate: async (platform: string, accountId: string, confirmationCode: string) => {
    try {
      const response = await api.post(`/social-accounts/verify-update/${platform}/${accountId}`, {
        confirmationCode,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify social media account credentials
   * @param platform Platform name
   * @param username Username or email
   * @param password Password
   * @returns Verification result
   */
  verifyCredentials: async (platform: string, username: string, password: string) => {
    try {
      const response = await api.post('/social-accounts/verify-credentials', {
        platform,
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Content API
 *
 * Handles content generation and posting to social media platforms.
 */
export const content = {
  /**
   * Generate content for a specific platform
   * @param platform Platform to generate content for
   * @param prompt Optional custom prompt to guide content generation
   * @returns Generated content
   */
  generate: async (platform: string, prompt?: string) => {
    try {
      const response = await api.post('/generate', { platform, prompt });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Post content to a specific platform
   * @param platform Platform to post to
   * @param content Content to post
   * @param mediaFiles Optional media files to include
   * @returns Post response
   */
  post: async (platform: string, content: string | object, mediaFiles?: string[]) => {
    try {
      const response = await api.post(`/post/${platform}`, { content, mediaFiles });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Post content to multiple platforms
   * @param platformsContent Map of platforms to content
   * @param mediaFiles Optional media files to include
   * @returns Post responses for each platform
   */
  postMultiple: async (platformsContent: Record<string, string | object>, mediaFiles?: string[]) => {
    try {
      const response = await api.post('/post/multiple', { platformsContent, mediaFiles });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save content as a draft
   * @param platform Platform the content is for
   * @param content Content to save
   * @param title Optional title for the draft
   * @returns Saved draft
   */
  saveDraft: async (platform: string, content: string | object, title?: string) => {
    try {
      const response = await api.post('/drafts', { platform, content, title });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all saved drafts
   * @returns List of drafts
   */
  getDrafts: async () => {
    try {
      const response = await api.get('/drafts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a specific draft
   * @param draftId ID of the draft to retrieve
   * @returns Draft content
   */
  getDraft: async (draftId: string) => {
    try {
      const response = await api.get(`/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a draft
   * @param draftId ID of the draft to update
   * @param updates Updates to apply
   * @returns Updated draft
   */
  updateDraft: async (draftId: string, updates: {
    platform?: string;
    content?: string | object;
    title?: string;
  }) => {
    try {
      const response = await api.patch(`/drafts/${draftId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a draft
   * @param draftId ID of the draft to delete
   * @returns Success response
   */
  deleteDraft: async (draftId: string) => {
    try {
      const response = await api.delete(`/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  auth,
  socialAccounts,
  content,
};
