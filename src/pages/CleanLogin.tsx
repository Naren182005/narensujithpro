import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, LogIn, AlertCircle, Loader2, Eye, EyeOff, Mail, Lock, BrainCircuit } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cleanGoogleAuthService } from '@/lib/clean-google-auth';
import { useAuth } from '@/contexts/AuthContext';

const CleanLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (loginError) setLoginError(null);
  };

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // For demo purposes, create a mock user
      const mockUser = {
        id: 'email_user_' + Date.now(),
        email: formData.email,
        name: formData.email.split('@')[0],
        picture: 'https://via.placeholder.com/150',
        verified_email: true
      };

      // Store auth data
      const authToken = `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userProfile', JSON.stringify(mockUser));
      localStorage.setItem('lastLoginTime', Date.now().toString());
      localStorage.setItem('loginMethod', 'email');

      // Update auth context
      login(mockUser);

      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (error: any) {
      setLoginError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      toast.info('Processing Google login...');
      
      const googleResult = await cleanGoogleAuthService.handleGoogleSuccess(credentialResponse);

      if (googleResult.success && googleResult.user) {
        login(googleResult.user);
        toast.success(googleResult.message || 'Google login successful!');
        navigate('/', { replace: true });
      } else {
        throw new Error(googleResult.message || 'Google login failed');
      }
    } catch (error: any) {
      setLoginError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    setLoginError('Google login was cancelled or failed. Please try again.');
    toast.error('Google login was cancelled or failed. Please try again.');
  };

  // Development mode login
  const handleDevModeLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      toast.info('Using development mode login...');
      
      const devResult = cleanGoogleAuthService.createDevModeUser();
      
      if (devResult.success && devResult.user) {
        login(devResult.user);
        toast.success(devResult.message || 'Development login successful!');
        navigate('/', { replace: true });
      } else {
        throw new Error('Development mode login failed');
      }
    } catch (error: any) {
      setLoginError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-300">Choose your preferred sign-in method</p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span className="text-red-200 text-sm">{loginError}</span>
            </div>
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-300">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              logo_alignment="left"
              width="100%"
            />

            {/* Development Mode Button */}
            <button
              type="button"
              onClick={handleDevModeLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-orange-300/50 rounded-lg text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">Development Mode Login</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanLogin;
