/**
 * Application Configuration
 *
 * This file contains environment-specific configuration settings.
 * It automatically selects the appropriate configuration based on the current environment.
 */

type EnvironmentConfig = {
  apiBaseUrl: string;
  frontendUrl: string;
  appName: string;
  defaultUserProfile: {
    name: string;
    email: string;
    username: string;
  };
  socialPlatforms: string[];
  googleApiKey?: string;
  googleClientId: string;
  features: {
    enableTwitter: boolean;
    enableFacebook: boolean;
    enableInstagram: boolean;
    enableLinkedIn: boolean;
    enableYouTube: boolean;
    enableAnalytics: boolean;
    enableScheduling: boolean;
  };
};

type AppConfig = {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
  test: EnvironmentConfig;
};

// Configuration for different environments
const config: AppConfig = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    frontendUrl: 'http://localhost:5173',
    appName: 'SocialMuse (Dev)',
    defaultUserProfile: {
      name: 'naren',
      email: 'naren1872005@gmail.com',
      username: 'naren187',
    },
    socialPlatforms: ['linkedin', 'instagram', 'facebook', 'youtube'],
    googleApiKey: 'AIzaSyCJRSVvyiZ0emsCQankfDv70gsVoCdsbyY',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '763549280829-chb0u2g8vbc3uflojo61dua7832bdivd.apps.googleusercontent.com',
    features: {
      enableTwitter: false, // Removed as per user preference
      enableFacebook: true, // Enabled as per user request
      enableInstagram: true,
      enableLinkedIn: true,
      enableYouTube: true,
      enableAnalytics: true,
      enableScheduling: true,
    },
  },
  production: {
    apiBaseUrl: '/api', // In production, use relative URLs to avoid CORS issues
    frontendUrl: typeof window !== 'undefined' ? window.location.origin : '',
    appName: 'SocialMuse',
    defaultUserProfile: {
      name: 'naren',
      email: 'naren1872005@gmail.com',
      username: 'naren187',
    },
    socialPlatforms: ['linkedin', 'instagram', 'facebook', 'youtube'],
    googleApiKey: 'AIzaSyCJRSVvyiZ0emsCQankfDv70gsVoCdsbyY',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '763549280829-chb0u2g8vbc3uflojo61dua7832bdivd.apps.googleusercontent.com',
    features: {
      enableTwitter: false,
      enableFacebook: true,
      enableInstagram: true,
      enableLinkedIn: true,
      enableYouTube: true,
      enableAnalytics: true,
      enableScheduling: true,
    },
  },
  test: {
    apiBaseUrl: 'http://localhost:3000/api',
    frontendUrl: 'http://localhost:5173',
    appName: 'SocialMuse (Test)',
    defaultUserProfile: {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
    },
    socialPlatforms: ['linkedin', 'instagram', 'facebook', 'youtube'],
    googleApiKey: 'AIzaSyCJRSVvyiZ0emsCQankfDv70gsVoCdsbyY',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '763549280829-chb0u2g8vbc3uflojo61dua7832bdivd.apps.googleusercontent.com',
    features: {
      enableTwitter: false,
      enableFacebook: true,
      enableInstagram: true,
      enableLinkedIn: true,
      enableYouTube: true,
      enableAnalytics: true,
      enableScheduling: true,
    },
  },
};

// Determine the current environment
const getEnvironment = (): 'development' | 'production' | 'test' => {
  // Check if we're in a test environment
  if (import.meta.env.MODE === 'test') {
    return 'test';
  }

  // Check if we're in a production environment
  if (import.meta.env.PROD) {
    return 'production';
  }

  // Default to development
  return 'development';
};

// Export the configuration for the current environment
const currentEnv = getEnvironment();
export default config[currentEnv];
