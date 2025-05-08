import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LogIn,
  LogOut,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SocialAuthButton, { PlatformType } from './SocialAuthButton';
import { getAuthStatus, logoutAll } from '@/lib/social-api';
import { toast } from '@/components/ui/sonner';

interface SocialAuthPanelProps {
  onAuthStatusChange: (status: Record<PlatformType, boolean>) => void;
  className?: string;
}

export const SocialAuthPanel: React.FC<SocialAuthPanelProps> = ({
  onAuthStatusChange,
  className,
}) => {
  const [authStatus, setAuthStatus] = useState<Record<PlatformType, boolean>>({
    linkedin: false,
    instagram: false,
    facebook: false,
    youtube: false,
  });

  const [profiles, setProfiles] = useState<Record<PlatformType, any>>({
    linkedin: null,
    instagram: null,
    facebook: null,
    youtube: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const platforms: PlatformType[] = ['linkedin', 'instagram', 'facebook', 'youtube'];

  // Fetch initial auth status
  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Notify parent component when auth status changes
  useEffect(() => {
    onAuthStatusChange(authStatus);
  }, [authStatus, onAuthStatusChange]);

  const fetchAuthStatus = async () => {
    try {
      setIsRefreshing(true);
      const status = await getAuthStatus();

      const newAuthStatus: Record<PlatformType, boolean> = {
        linkedin: false,
        instagram: false,
        facebook: false,
        youtube: false,
      };

      const newProfiles: Record<PlatformType, any> = {
        linkedin: null,
        instagram: null,
        facebook: null,
        youtube: null,
      };

      platforms.forEach(platform => {
        newAuthStatus[platform] = status.platforms[platform].authenticated;
        newProfiles[platform] = status.platforms[platform].profile;
      });

      setAuthStatus(newAuthStatus);
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error fetching auth status:', error);
      toast.error('Failed to fetch authentication status');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAuthChange = (platform: PlatformType, isAuthenticated: boolean, profile?: any) => {
    setAuthStatus(prev => ({
      ...prev,
      [platform]: isAuthenticated
    }));

    if (profile) {
      setProfiles(prev => ({
        ...prev,
        [platform]: profile
      }));
    } else if (!isAuthenticated) {
      setProfiles(prev => ({
        ...prev,
        [platform]: null
      }));
    }
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAll();

      const newAuthStatus: Record<PlatformType, boolean> = {
        linkedin: false,
        instagram: false,
        facebook: false,
        youtube: false,
      };

      const newProfiles: Record<PlatformType, any> = {
        linkedin: null,
        instagram: null,
        facebook: null,
        youtube: null,
      };

      setAuthStatus(newAuthStatus);
      setProfiles(newProfiles);

      toast.success('Logged out from all platforms');
    } catch (error) {
      console.error('Error logging out from all platforms:', error);
      toast.error('Failed to logout from all platforms');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const connectedCount = Object.values(authStatus).filter(Boolean).length;
  const allConnected = connectedCount === platforms.length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social Media Accounts</CardTitle>
            <CardDescription>Connect your social media accounts to post content</CardDescription>
          </div>
          <Badge variant={allConnected ? "default" : "outline"} className={allConnected ? "bg-green-500" : ""}>
            {connectedCount}/{platforms.length} Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {platforms.map(platform => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SocialAuthButton
                    platform={platform}
                    isAuthenticated={authStatus[platform]}
                    onAuthChange={handleAuthChange}
                    size="sm"
                  />

                  {profiles[platform] && (
                    <div className="text-sm">
                      <span className="font-medium">{profiles[platform].name}</span>
                      <span className="text-muted-foreground ml-2">@{profiles[platform].username}</span>
                    </div>
                  )}
                </div>

                <div>
                  {authStatus[platform] ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between py-4">
        <div className="flex items-center">
          {allConnected ? (
            <div className="flex items-center text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              All accounts connected
            </div>
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-1" />
              Connect all accounts to enable cross-posting
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuthStatus}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogoutAll}
            disabled={isLoggingOut || connectedCount === 0}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-1" />
            )}
            Disconnect All
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SocialAuthPanel;
