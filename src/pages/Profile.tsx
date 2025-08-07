import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Key, Save, Loader2, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { handleError } from '@/lib/error-handler';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import config from '@/config';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    avatar: '',
    loginMethod: 'email' as 'email' | 'google'
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if user is authenticated
        if (!enhancedAuthService.isAuthenticated()) {
          toast.error('Please log in to view your profile');
          navigate('/login');
          return;
        }

        // Get current user from enhanced auth service
        const currentUser = enhancedAuthService.getCurrentUser();
        if (currentUser) {
          setProfile({
            name: currentUser.name,
            email: currentUser.email,
            username: currentUser.email.split('@')[0], // Generate username from email
            avatar: currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
            loginMethod: currentUser.loginMethod
          });
        } else {
          // No user found, redirect to login
          toast.error('Please log in to view your profile');
          navigate('/login');
        }
      } catch (error) {
        handleError(error);
      }
    };
    
    loadProfile();
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    enhancedAuthService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);

      // Validate inputs
      if (!profile.name.trim() || !profile.email.trim()) {
        toast.error('Name and email are required');
        return;
      }

      // Use enhanced auth service to update profile
      const response = await enhancedAuthService.updateProfile({
        name: profile.name,
        email: profile.email,
        picture: profile.avatar
      });

      if (response.success) {
        toast.success(response.message || 'Profile updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('All fields are required');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      
      // Use enhanced auth service to change password
      const response = await enhancedAuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        toast.success(response.message || 'Password changed successfully');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profile.loginMethod === 'google'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.loginMethod === 'google' ? '🔗 Google Account' : '📧 Email Account'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-10"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      className="pl-10"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button onClick={handleProfileUpdate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.loginMethod === 'google' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-blue-800 font-medium">
                      Google Account
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    You signed in with Google. You can still set a password for additional security.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type="password"
                    className="pl-10"
                    placeholder={profile.loginMethod === 'google' ? 'Leave empty if you don\'t have a password' : 'Enter current password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    className="pl-10"
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    className="pl-10"
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 font-medium">Password Requirements:</p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  <li className={`flex items-center gap-2 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    At least 6 characters
                  </li>
                  <li className={`flex items-center gap-2 ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'text-green-600' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    Passwords match
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handlePasswordChange} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
