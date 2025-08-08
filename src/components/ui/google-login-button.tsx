/**
 * 🎨 STUNNING Google Login Button Component
 *
 * World-class, premium Google login button featuring:
 * - Breathtaking animations and micro-interactions
 * - Glassmorphism and modern design trends
 * - Professional Material Design 3.0 styling
 * - Accessibility and responsive design
 * - Premium visual effects and transitions
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Loader2, Shield, CheckCircle, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  isLoading?: boolean;
  text?: 'signin' | 'signup' | 'continue';
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'glassmorphism' | 'premium' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSecurityBadge?: boolean;
  animated?: boolean;
  glowEffect?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  isLoading = false,
  text = 'continue',
  className,
  disabled = false,
  variant = 'premium',
  size = 'lg',
  showSecurityBadge = true,
  animated = true,
  glowEffect = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number}>>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
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

  const createRipple = (event: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm h-10 min-h-[40px] min-w-[200px]';
      case 'md':
        return 'px-6 py-3 text-base h-12 min-h-[48px] min-w-[250px]';
      case 'lg':
        return 'px-6 py-3 text-base h-12 min-h-[48px] min-w-[260px]';
      case 'xl':
        return 'px-8 py-3.5 text-lg h-14 min-h-[56px] min-w-[300px]';
      default:
        return 'px-6 py-3 text-base h-12 min-h-[48px] min-w-[260px]';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glassmorphism':
        return 'bg-white/20 backdrop-blur-xl border border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/50';
      case 'premium':
        return 'bg-gradient-to-r from-white via-gray-50 to-white border-2 border-gray-200/50 text-gray-800 hover:from-blue-50 hover:via-white hover:to-blue-50 hover:border-blue-300/50 shadow-xl hover:shadow-2xl';
      case 'neon':
        return 'bg-gray-900 border-2 border-blue-500 text-white hover:bg-gray-800 hover:border-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50';
      case 'default':
      default:
        return 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400';
    }
  };

  if (isLoading || disabled) {
    return (
      <div className={cn("relative w-full", className)}>
        <div
          className={cn(
            "relative w-full flex items-center justify-center font-semibold rounded-2xl",
            "transition-all duration-500 ease-out transform",
            "disabled:cursor-not-allowed overflow-hidden group",
            getSizeClasses(),
            getVariantClasses(),
            glowEffect && variant === 'premium' && "shadow-2xl shadow-blue-500/20",
            glowEffect && variant === 'neon' && "shadow-2xl shadow-blue-500/50"
          )}
        >
          {/* Premium background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

          {/* Floating particles effect */}
          {animated && mounted && (
            <>
              <div className="absolute top-2 left-4 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100" />
              <div className="absolute top-3 right-6 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-300" />
              <div className="absolute bottom-2 left-8 w-1 h-1 bg-blue-300 rounded-full animate-bounce delay-500" />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isLoading ? (
              <>
                <div className="relative">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-blue-400/30" />
                  <div className="absolute inset-0 h-6 w-6 animate-pulse rounded-full bg-purple-400/20" />
                </div>
                <span className="font-semibold tracking-wide">
                  Connecting to Google...
                </span>
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
              </>
            ) : (
              <>
                <GoogleIcon className="h-6 w-6" />
                <span className="tracking-wide">{getButtonText()}</span>
              </>
            )}
          </div>

          {/* Premium loading waves */}
          {isLoading && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[wave_2s_infinite]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full animate-[wave_2.5s_infinite]" />
            </>
          )}
        </div>

        {/* Enhanced security badge */}
        {showSecurityBadge && (
          <div className="flex items-center justify-center mt-3 text-sm text-gray-600 animate-fade-in">
            <Lock className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-medium">Enterprise Security</span>
            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full group", className)}>
      {/* Hidden GoogleLogin for functionality */}
      <div className="google-login-wrapper absolute inset-0 opacity-0 pointer-events-auto z-30">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={(error) => {
            console.warn('Google Login Error (will fallback):', error);
            onError(error);
          }}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          logo_alignment="left"
          useOneTap={false}
          auto_select={false}
        />
      </div>

      {/* 🎨 STUNNING Interactive Button Overlay */}
      <div
        ref={buttonRef}
        className="absolute inset-0 pointer-events-none z-20"
      >
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={(e) => {
            setIsPressed(true);
            createRipple(e);
          }}
          onMouseUp={() => setIsPressed(false)}
          className={cn(
            "w-full h-full flex items-center justify-center font-semibold rounded-2xl",
            "transition-all duration-500 ease-out transform-gpu",
            "focus:outline-none focus:ring-4 focus:ring-blue-500/30",
            "relative overflow-hidden cursor-pointer",
            getSizeClasses(),
            getVariantClasses(),
            // Hover effects
            isHovered && "scale-[1.03] -translate-y-1",
            isPressed && "scale-[0.97] translate-y-0",
            // Glow effects
            glowEffect && isHovered && variant === 'premium' && "shadow-2xl shadow-blue-500/25",
            glowEffect && isHovered && variant === 'neon' && "shadow-2xl shadow-blue-500/60",
            glowEffect && isHovered && variant === 'glassmorphism' && "shadow-xl shadow-white/50"
          )}
        >
          {/* 🌟 Premium Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* ✨ Magical Floating Particles */}
          {animated && mounted && isHovered && (
            <>
              <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100 opacity-70" />
              <div className="absolute top-3 right-6 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-300 opacity-60" />
              <div className="absolute bottom-2 left-8 w-1 h-1 bg-blue-300 rounded-full animate-bounce delay-500 opacity-80" />
              <div className="absolute bottom-3 right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-700 opacity-50" />
            </>
          )}

          {/* 💫 Ripple Effects */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute w-4 h-4 bg-blue-400/30 rounded-full animate-ping pointer-events-none"
              style={{
                left: ripple.x - 8,
                top: ripple.y - 8,
              }}
            />
          ))}

          {/* 🎯 PERFECT - Content Container */}
          <div className="relative z-20 flex items-center justify-center gap-3 w-full h-full px-4">
            {/* 🎨 Google Icon - Perfect Display */}
            <GoogleIcon className="h-5 w-5 flex-shrink-0" />

            {/* ✨ Button Text - Perfect Alignment */}
            <span className="font-medium text-base leading-tight">
              {getButtonText()}
            </span>
          </div>

          {/* 🌈 Premium Shine Effects */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent skew-x-12 delay-200" />

          {/* 💎 Border Glow Effects */}
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-500" />
          {glowEffect && (
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
          )}
        </button>
      </div>

      {/* 🛡️ Premium Security Badge */}
      {showSecurityBadge && (
        <div className="flex items-center justify-center mt-4 text-sm text-gray-600 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border border-green-200/50">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-gray-700">Enterprise Security</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
      )}

      {/* 🎨 Enhanced CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .google-login-wrapper div[data-testid="google-login"] {
            opacity: 0 !important;
            position: absolute !important;
            pointer-events: none !important;
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }

          @keyframes wave {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }

          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }

          .text-shadow-sm {
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .transform-gpu {
            transform: translate3d(0, 0, 0);
          }
        `
      }} />
    </div>
  );
};

// Enhanced Google Icon Component with proper colors
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-label="Google">
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
);

export default GoogleLoginButton;
