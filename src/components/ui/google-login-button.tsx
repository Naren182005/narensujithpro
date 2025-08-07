/**
 * Custom Google Login Button Component
 * 
 * A beautiful, unique Google login button with animations and modern design
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  isLoading?: boolean;
  text?: 'signin' | 'signup' | 'continue';
  className?: string;
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  isLoading = false,
  text = 'continue',
  className,
  disabled = false
}) => {
  const getButtonText = () => {
    switch (text) {
      case 'signin':
        return 'Sign in with Google';
      case 'signup':
        return 'Sign up with Google';
      case 'continue':
      default:
        return 'Continue with Google';
    }
  };

  if (isLoading || disabled) {
    return (
      <button
        disabled
        className={cn(
          "relative w-full flex items-center justify-center gap-3 px-6 py-3.5",
          "bg-white hover:bg-gray-50 border border-gray-300 rounded-xl",
          "text-gray-700 font-medium text-base",
          "transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{getButtonText()}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Custom styled wrapper for GoogleLogin */}
      <div className="google-login-wrapper">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={(error) => {
            console.warn('Google Login Error (will fallback):', error);
            // Don't log detailed error to avoid console spam
            onError(error);
          }}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          logo_alignment="left"
          width="100%"
          useOneTap={false}
          auto_select={false}
        />
      </div>
      
      {/* Custom overlay button for better styling */}
      <div className="absolute inset-0 pointer-events-none">
        <button
          className={cn(
            "w-full h-full flex items-center justify-center gap-3 px-6 py-3.5",
            "bg-white hover:bg-gray-50 border border-gray-300 rounded-xl",
            "text-gray-700 font-medium text-base",
            "transition-all duration-200 ease-in-out transform hover:scale-[1.02]",
            "shadow-sm hover:shadow-md hover:border-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "group relative overflow-hidden"
          )}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/20 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Google Icon */}
          <svg className="h-5 w-5 relative z-10" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          
          {/* Button Text */}
          <span className="relative z-10 font-medium">
            {getButtonText()}
          </span>
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </button>
      </div>
      
      {/* Hide the default GoogleLogin button */}
      <style jsx>{`
        .google-login-wrapper :global(div[data-testid="google-login"]) {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default GoogleLoginButton;
