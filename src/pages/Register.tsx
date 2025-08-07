import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { handleError } from '@/lib/error-handler';
import config from '@/config';
import { googleAuthService } from '@/lib/google-auth';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import GoogleLoginButton from '@/components/ui/google-login-button';

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

// Define form validation schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      console.log('Registration attempt with:', values);

      // Show loading toast
      toast.info('Creating your account...');

      // Use enhanced auth service for registration
      const response = await enhancedAuthService.register(values.name, values.email, values.password);

      if (response.success && response.user) {
        console.log('Registration successful:', response.user);

        // Show success message
        toast.success(response.message || 'Account created successfully! Welcome to SocialMuse!');

        // Redirect to home page
        navigate('/');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      handleError(error, { context: 'registration' });
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);

    try {
      // Show a toast to indicate login attempt
      toast.info('Processing Google sign up...');

      // Use the Google auth service to decode the credential
      const googleResult = await googleAuthService.handleGoogleSuccess(credentialResponse);

      if (googleResult.success && googleResult.user) {
        // Use enhanced auth service to store the user
        const authResult = await enhancedAuthService.googleAuth(googleResult.user);

        if (authResult.success) {
          // Show success message
          toast.success('Google sign up successful!');

          // Redirect to home page
          navigate('/');
        } else {
          throw new Error(authResult.message || 'Failed to save Google user data');
        }
      } else {
        throw new Error(googleResult.message || 'Google sign up failed');
      }
    } catch (error: any) {
      handleError(error, { context: 'google-signup' });
      toast.error('Google sign up failed. Please try again or use email registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    toast.error('Google sign up was cancelled or failed. Please try again.');
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setIsLoading(true);

    try {
      // Show a toast to indicate signup attempt
      toast.info('Signing up with Google...');

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
      toast.success('Google signup successful!');

      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      // Use our centralized error handler
      handleError(error, { context: 'google-signup' });

      // Show error message
      toast.error('Google signup failed. Please try again or use email signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{config.appName}</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I accept the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </span>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
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
              <div className="w-full max-w-xs">
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  isLoading={isLoading}
                  text="signup"
                />
              </div>
            </div>

            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
