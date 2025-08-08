import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Settings,
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
  Shield,
  Key,
  Mail,
  Sparkles
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import SocialAccountsManager from '@/components/SocialAccountsManager';
import { PlatformType } from '@/components/SocialAuthButton';

// Define form validation schema for profile
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  bio: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

// Define form validation schema for password
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authStatus, setAuthStatus] = useState<Record<PlatformType, boolean>>({
    linkedin: false,
    instagram: false,
    twitter: false,
    facebook: false,
    youtube: false,
  });

  const navigate = useNavigate();

  // Get real user data from localStorage/authentication
  const [userData, setUserData] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

      // Merge user data from different sources
      const user = { ...currentUser, ...userProfile };

      return {
        name: user.name || 'User',
        email: user.email || 'user@example.com',
        bio: user.bio || 'SocialMuse user',
        website: user.website || '',
        avatarUrl: user.picture || user.avatar || '',
        authProvider: user.authProvider || user.loginMethod || 'email',
        isVerified: user.emailVerified || user.verified_email || false,
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return {
        name: 'User',
        email: 'user@example.com',
        bio: 'SocialMuse user',
        website: '',
        avatarUrl: '',
        authProvider: 'email',
        isVerified: false,
      };
    }
  });

  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
      website: userData.website,
    },
  });

  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form values when userData changes
  useEffect(() => {
    profileForm.reset({
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
      website: userData.website,
    });
  }, [userData, profileForm]);

  // Handle profile form submission
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);

    try {
      // Simulate API call
      console.log('Updating profile with:', values);

      // In a real app, you would call your API here
      // const response = await updateUserProfile(values);

      // Simulate successful update after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local user data
      setUserData(prev => ({
        ...prev,
        name: values.name,
        email: values.email,
        bio: values.bio || '',
        website: values.website || '',
      }));

      // Show success message
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password form submission
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);

    try {
      // Simulate API call
      console.log('Updating password with:', values);

      // In a real app, you would call your API here
      // const response = await updateUserPassword(values);

      // Simulate successful update after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Show success message
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      console.log('Logging out...');

      // In a real app, you would call your logout API here
      // await logout();

      // Simulate successful logout after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle accounts change
  const handleAccountsChange = (accounts: Record<PlatformType, any[]>) => {
    // Update connected status based on accounts
    const newAuthStatus: Record<PlatformType, boolean> = {
      linkedin: false,
      instagram: false,
      twitter: false,
      facebook: false,
      youtube: false,
    };

    Object.entries(accounts).forEach(([platform, platformAccounts]) => {
      newAuthStatus[platform as PlatformType] = platformAccounts.some(account => account.connected);
    });

    setAuthStatus(newAuthStatus);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Count connected social accounts
  const connectedAccountsCount = Object.values(authStatus).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-600/50 bg-slate-800/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-800/80">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-gray-100">SocialMuse</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 🎨 Enhanced Sidebar */}
          <div className="md:w-1/4">
            <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-t-lg">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-xl">
                      <AvatarImage src={userData.avatarUrl} alt={userData.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Profile picture overlay */}
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Profile Photo</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-100">{userData.name}</CardTitle>
                  <CardDescription className="text-gray-300">{userData.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Social Accounts</span>
                    <span className="text-sm font-medium">{connectedAccountsCount}/5</span>
                  </div>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('social')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Social Accounts
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('security')}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Security
                  </Button>
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🎯 Enhanced Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-lg">
                <TabsTrigger value="profile" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  👤 Profile
                </TabsTrigger>
                <TabsTrigger value="social" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🔗 Social
                </TabsTrigger>
                <TabsTrigger value="security" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  🔐 Security
                </TabsTrigger>
              </TabsList>

              {/* 🎨 Enhanced Profile Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                      👤 Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Update your personal information and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormDescription>
                                This email will be used for notifications and login
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                A brief description about yourself
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://example.com" />
                              </FormControl>
                              <FormDescription>
                                Your personal or business website
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSaving}
                        >
                          {isSaving ? (
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
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Accounts Tab */}
              <TabsContent value="social">
                <SocialAccountsManager onAccountsChange={handleAccountsChange} />
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSaving}
                        >
                          {isSaving ? (
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
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
