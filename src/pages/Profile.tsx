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
        // Debug authentication state
        const isAuth = enhancedAuthService.isAuthenticated();
        const currentUser = enhancedAuthService.getCurrentUser();
        const accessToken = enhancedAuthService.getAccessToken();

        console.log('🔍 Profile page debug:');
        console.log('   Is authenticated:', isAuth);
        console.log('   Current user:', currentUser);
        console.log('   Access token:', !!accessToken);

        // Check if user is authenticated
        if (!isAuth) {
          console.log('❌ User not authenticated, redirecting to login');
          toast.error('Please log in to view your profile');
          navigate('/login');
          return;
        }

        // Get current user from enhanced auth service
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
  
  // Enhanced password change with comprehensive validation
  const handlePasswordChange = async () => {
    try {
      setIsLoading(true);

      // Enhanced validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('All password fields are required');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      // Enhanced password strength validation
      if (passwordData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return;
      }

      // Check for password complexity
      const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
      const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
      const hasNumbers = /\d/.test(passwordData.newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        toast.error('Password must contain uppercase, lowercase, number, and special character');
        return;
      }

      // Check if user is Google user
      if (profile.loginMethod === 'google' && !passwordData.currentPassword) {
        // For Google users without existing password, allow setting new password
        console.log('🔑 Setting password for Google user');
      }

      console.log('🔄 Attempting password change...');

      // Use enhanced auth service to change password
      const response = await enhancedAuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      console.log('📝 Password change response:', response);

      if (response.success) {
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        toast.success(response.message || 'Password changed successfully!');
        console.log('✅ Password changed successfully');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('❌ Password change error:', error);

      // Enhanced error handling
      if (error.message.includes('Current password is incorrect')) {
        toast.error('Current password is incorrect');
      } else if (error.message.includes('WEAK_PASSWORD')) {
        toast.error('Password does not meet security requirements');
      } else if (error.message.includes('USER_NOT_FOUND')) {
        toast.error('User account not found');
      } else {
        toast.error(error.message || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🎨 Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Manage your profile, security settings, and account preferences
          </p>
        </div>

        {/* 🎯 Enhanced Navigation Tabs */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-lg">
            <TabsTrigger value="profile" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              👤 Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              🔐 Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                  👤 Profile Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* 🎨 Enhanced Profile Header */}
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                    <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Profile picture overlay */}
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Google Photo</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-2xl font-bold text-gray-100">{profile.name}</h3>
                  <p className="text-gray-300 text-lg">{profile.email}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                      profile.loginMethod === 'google'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    }`}>
                      {profile.loginMethod === 'google' ? '🔗 Google Account' : '📧 Email Account'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      ✅ Verified
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
        
        <TabsContent value="password" className="mt-8">
          <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                🔐 Security Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Update your password and security preferences
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
                  <p className="text-xs text-blue-700 mt-2 leading-relaxed">
                    You can set a password for additional security. Leave current password empty if you don't have one yet.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    💡 <strong>Tip:</strong> Adding a password allows you to sign in with email if Google is unavailable.
                  </div>
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
                    placeholder="Enter new password (min. 8 characters)"
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
    </div>
  );
};

export default Profile;
