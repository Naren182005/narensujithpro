import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles, LogIn, AlertCircle, Loader2,
  Eye, EyeOff, Mail, Lock, ArrowRight,
  User, BrainCircuit, Phone
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { auth } from '@/lib/api-client';
import { handleError } from '@/lib/error-handler';
import config from '@/config';
import { CountrySelector } from '@/components/ui/country-selector';
import { CountryCode, defaultCountry } from '@/lib/country-codes';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().default(false),
});

// Define phone login form schema
const phoneSchema = z.object({
  phoneNumber: z.string().min(5, { message: 'Please enter a valid phone number' }),
  otp: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [lastLoginInfo, setLastLoginInfo] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const navigate = useNavigate();

  // Initialize password login form with default values from localStorage if "remember me" was checked
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || 'naren1872005@gmail.com', // Default to remembered email or Naren's email
      password: '',
      rememberMe: localStorage.getItem('rememberedEmail') ? true : false,
    },
  });

  // Initialize phone login form
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
      otp: '',
    },
  });

  // Clear any error when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (loginError) {
        setLoginError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, loginError]);

  // Also clear errors when phone form changes
  useEffect(() => {
    const subscription = phoneForm.watch(() => {
      if (loginError) {
        setLoginError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [phoneForm, loginError]);

  // Check for last login info
  useEffect(() => {
    const lastLogin = localStorage.getItem('lastLoginTime');
    if (lastLogin) {
      const date = new Date(parseInt(lastLogin));
      setLastLoginInfo(`Last login: ${date.toLocaleString()}`);
    }
  }, []);

  // Handle password form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    setLoginAttempts(prev => prev + 1);

    try {
      console.log('Attempting login with:', values.email);

      // Show a toast to indicate login attempt
      toast.info('Logging in...');

      // Use the direct login endpoint (which now uses a mock implementation)
      const response = await auth.directLogin({
        email: values.email,
        password: values.password
      });

      console.log('Login response:', response);

      // If remember me is checked, store the email
      if (values.rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Store last login time
      localStorage.setItem('lastLoginTime', Date.now().toString());

      // Show success message
      toast.success('Login successful!');

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      // Use our centralized error handler
      handleError(error, { context: 'login', email: values.email });

      // Set a user-friendly error message
      if (error.message && error.message.includes('Password must be at least 6 characters')) {
        setLoginError('Password must be at least 6 characters');
      } else {
        setLoginError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone number verification
  const sendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const fullPhoneNumber = `${selectedCountry.dial_code}${phoneNumber}`;
      console.log('Sending OTP to:', fullPhoneNumber);

      // Show a toast to indicate the process
      toast.info(`Sending OTP to ${fullPhoneNumber}...`);

      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a random 6-digit OTP (in a real app, this would be sent by the server)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', generatedOtp);

      // In a real app, this would be sent via SMS
      // For demo purposes, we'll show it in a toast
      toast.success(`OTP sent to ${fullPhoneNumber}! For demo purposes, your OTP is: ${generatedOtp}`);

      // Store the OTP in localStorage for verification (NEVER do this in production)
      localStorage.setItem('currentOtp', generatedOtp);

      // Store the phone number with country code
      localStorage.setItem('lastPhoneNumber', fullPhoneNumber);

      setOtpSent(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error('OTP sending error:', error);
      setLoginError('Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle phone form submission
  const onPhoneFormSubmit = async (values: PhoneFormValues) => {
    if (!otpSent) {
      // If OTP hasn't been sent yet, send it
      await sendOtp(values.phoneNumber);
      return;
    }

    // If OTP has been sent, verify it
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('Verifying OTP:', values.otp);

      // Show a toast to indicate the process
      toast.info('Verifying OTP...');

      // Get the stored OTP (in a real app, this verification would happen on the server)
      const storedOtp = localStorage.getItem('currentOtp');

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (values.otp !== storedOtp) {
        throw new Error('Invalid OTP');
      }

      // Clear the stored OTP
      localStorage.removeItem('currentOtp');

      // Store the phone number for convenience
      localStorage.setItem('rememberedPhone', values.phoneNumber);

      // Store last login time
      localStorage.setItem('lastLoginTime', Date.now().toString());

      // Show success message
      toast.success('Login successful!');

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setLoginError('Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Show a toast to indicate login attempt
      toast.info('Logging in with Google...');

      // Simulate a delay for the Google OAuth process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a mock Google user
      const mockGoogleUser = {
        id: 'google-' + Date.now(),
        email: config.defaultUserProfile.email,
        name: config.defaultUserProfile.name,
        picture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(config.defaultUserProfile.name) + '&background=random'
      };

      // Generate a token
      const token = `google_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Store the token in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userProfile', JSON.stringify(mockGoogleUser));

      // Show success message
      toast.success('Google login successful!');

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      // Use our centralized error handler
      handleError(error, { context: 'google-login' });

      // Set a user-friendly error message
      setLoginError('Google login failed. Please try again or use email login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4 shadow-glow">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-slow" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{config.appName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card className="border-border/40 shadow-lg animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="email" onValueChange={(value) => {
            setLoginMethod(value as 'email' | 'phone');
            setOtpSent(false); // Reset OTP state when switching tabs
            setLoginError(null);
          }}>
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger value="email" className="tab-transition">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="tab-transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Phone Number
              </TabsTrigger>
            </TabsList>

            <CardContent className="pt-4">
              {loginError && (
                <Alert variant="destructive" className="mb-4 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {lastLoginInfo && (
                <div className="mb-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md flex items-center">
                  <User className="h-3 w-3 mr-2" />
                  {lastLoginInfo}
                </div>
              )}

              <TabsContent value="email" className="mt-0 pt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="form-field-animated">
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="you@example.com"
                                type="email"
                                className="pl-10 py-6"
                                {...field}
                              />
                            </FormControl>
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground field-icon" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="form-field-animated">
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 py-6"
                                {...field}
                              />
                            </FormControl>
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground field-icon" />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rememberMe"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="rememberMe"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Remember me
                            </label>
                          </div>
                        )}
                      />

                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-6 login-button bg-gradient-to-r from-primary to-accent group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <LogIn className="h-5 w-5" />
                          Sign in
                          <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="phone" className="mt-0 pt-0">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneFormSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="form-field-animated">
                          <FormLabel>Phone Number</FormLabel>
                          <div className="flex">
                            <div className="mr-2">
                              <CountrySelector
                                value={selectedCountry}
                                onChange={setSelectedCountry}
                                disabled={otpSent}
                              />
                            </div>
                            <div className="relative flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone number"
                                  type="tel"
                                  className="pl-3 py-6"
                                  {...field}
                                  disabled={otpSent && isLoading}
                                  onChange={(e) => {
                                    // Remove any non-numeric characters
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                    setPhoneNumber(value);
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            <Phone className="inline-block h-3 w-3 mr-1" />
                            Enter your phone number without country code
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {otpSent && (
                      <FormField
                        control={phoneForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="form-field-animated">
                            <FormLabel>One-Time Password (OTP)</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="Enter the 6-digit OTP"
                                  type="text"
                                  maxLength={6}
                                  className="pl-10 py-6"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setOtp(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground field-icon">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="bg-muted/30 p-3 rounded-md text-sm">
                      <div className="flex items-start gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          {otpSent
                            ? "Enter the 6-digit OTP sent to your phone number to complete login."
                            : "We'll send a one-time password (OTP) to your phone for secure login."}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-6 login-button bg-gradient-to-r from-primary to-accent group"
                      disabled={isLoading || (otpSent && !otp)}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {otpSent ? "Verifying OTP..." : "Sending OTP..."}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {otpSent ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              Verify OTP
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                              Send OTP
                            </>
                          )}
                          <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>

          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full max-w-xs social-login-button google-button"
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
                {" | "}
                <Link
                  to="/account"
                  className="font-medium text-primary hover:underline"
                >
                  Manage Account
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
