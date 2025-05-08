import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { handleAuthCallback } from '../lib/social-api';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the authentication
    const processAuth = async (platformParam?: string, codeParam?: string) => {
      try {
        const platformToUse = platformParam || searchParams.get('platform');
        const codeToUse = codeParam || searchParams.get('code');

        console.log('Processing auth for:', { platform: platformToUse, code: codeToUse ? `${codeToUse.substring(0, 10)}...` : null });

        const result = await handleAuthCallback(platformToUse, codeToUse);

        if (result.success) {
          toast.success(`Successfully connected to ${platformToUse}`);
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError(result.error || 'Authentication failed');
          toast.error(`Failed to connect to ${platformToUse}`);
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Error processing authentication:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    const platform = searchParams.get('platform');
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    const errorMessage = searchParams.get('error');

    // Debug: Log all parameters
    console.log('AuthCallback params:', {
      platform,
      code: code ? `${code.substring(0, 10)}...` : null,
      token: token ? `${token.substring(0, 10)}...` : null,
      error: errorMessage,
      allParams: Object.fromEntries([...searchParams.entries()])
    });

    if (errorMessage) {
      console.log('Auth error:', errorMessage);
      setError(errorMessage);
      setIsProcessing(false);
      toast.error(`Authentication failed: ${errorMessage}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (token) {
      // Token is already provided (from server redirect)
      console.log('Auth success with token');
      setIsProcessing(false);
      toast.success(`Successfully connected to ${platform}`);
      setTimeout(() => navigate('/'), 1000);
      return;
    }

    if (!platform && code) {
      // This might be a direct Facebook callback with just the code
      console.log('Detected Facebook callback with code only');
      // Process as Facebook auth
      processAuth('facebook', code);
      return;
    }

    if (!platform || !code) {
      console.log('Missing required params:', { platform, code });
      setError('Missing platform or authorization code');
      setIsProcessing(false);
      toast.error('Authentication failed: Missing required parameters');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Process normal authentication
    processAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {isProcessing ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Authentication</h1>
          <p className="text-muted-foreground">Please wait while we complete the authentication process...</p>
        </>
      ) : error ? (
        <>
          <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p>Redirecting you back to the home page...</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Authentication Successful</h1>
          <p className="text-muted-foreground mb-4">You have successfully authenticated.</p>
          <p>Redirecting you back to the home page...</p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
