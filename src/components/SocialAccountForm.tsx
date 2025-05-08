import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformType } from '@/components/SocialAuthButton';
import { simulateAuth } from '@/lib/social-api';

// Platform icons
const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

// Platform colors
const platformColors = {
  linkedin: 'text-[#0a66c2]',
  instagram: 'text-[#e4405f]',
  twitter: 'text-[#1DA1F2]',
  facebook: 'text-[#1877f2]',
  youtube: 'text-[#ff0000]',
};

// Platform names
const platformNames = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

// Define form validation schema
const accountSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  confirmationCode: z.string().min(6, { message: 'Confirmation code must be at least 6 characters' }),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface SocialAccountFormProps {
  platform: PlatformType;
  onAccountAdded: (platform: PlatformType, accountData: any) => void;
  existingAccount?: any;
}

const SocialAccountForm: React.FC<SocialAccountFormProps> = ({
  platform,
  onAccountAdded,
  existingAccount
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [verifyingCredentials, setVerifyingCredentials] = useState(false);
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false); // Added missing state variable
  const Icon = platformIcons[platform];
  const colorClass = platformColors[platform];
  const name = platformNames[platform];

  // Initialize form with existing account data if available
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: existingAccount?.username || '',
      password: existingAccount?.password || '',
      email: existingAccount?.email || '',
      confirmationCode: '',
    },
  });

  // Function to send confirmation code
  const sendConfirmationCode = async () => {
    const email = form.getValues('email');

    // Validate email
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // First verify the credentials
    if (!credentialsVerified) {
      const credentialsValid = await verifyCredentials();
      if (!credentialsValid) {
        return; // Stop if credentials are invalid
      }
    }

    setSendingCode(true);

    try {
      // In a real app, you would call your backend API to send the confirmation code
      // For now, we'll simulate it

      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // In a real app, you would send this code to the user's email
      console.log(`Confirmation code for ${email}: ${code}`);

      // Store the code in localStorage for verification (in a real app, this would be server-side)
      localStorage.setItem(`confirmation_code_${email}`, code);

      setCodeSent(true);
      toast.success(`Confirmation code sent to ${email}`);

      // Don't automatically move to confirmation step
      // Let the user enter the code first
    } catch (error) {
      console.error('Error sending confirmation code:', error);
      toast.error('Failed to send confirmation code. Please try again.');
    } finally {
      setSendingCode(false);
    }
  };

  // Function to verify confirmation code
  const verifyConfirmationCode = (code: string, email: string): boolean => {
    const storedCode = localStorage.getItem(`confirmation_code_${email}`);
    return storedCode === code;
  };

  // Function to verify social media credentials
  const verifyCredentials = async () => {
    const username = form.getValues('username');
    const password = form.getValues('password');

    // Validate required fields
    if (!username || !password) {
      toast.error('Username and password are required');
      return false;
    }

    setVerifyingCredentials(true);
    setCredentialError(null);

    try {
      // Call the backend API to verify credentials
      const response = await axios.post('http://localhost:3001/api/social-accounts/verify-credentials', {
        platform,
        username,
        password
      });

      if (response.data.success) {
        setCredentialsVerified(true);
        toast.success(`${name} credentials verified successfully`);
        return true;
      } else {
        setCredentialError(response.data.message || `Invalid ${name} credentials`);
        toast.error(response.data.message || `Invalid ${name} credentials`);
        return false;
      }
    } catch (error) {
      console.error(`Error verifying ${platform} credentials:`, error);
      const errorMessage = error.response?.data?.message || `Failed to verify ${name} credentials`;
      setCredentialError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setVerifyingCredentials(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: AccountFormValues) => {
    // If we're in the confirmation step, verify the code and complete the connection
    if (confirmationStep) {
      if (!verifyConfirmationCode(values.confirmationCode || '', values.email)) {
        toast.error('Invalid confirmation code. Please try again.');
        return;
      }
    } else {
      // If not in confirmation step, verify the code and move to confirmation step
      if (!codeSent) {
        toast.error('Please send a confirmation code first');
        return;
      }

      if (!verifyConfirmationCode(values.confirmationCode || '', values.email)) {
        toast.error('Invalid confirmation code. Please try again.');
        return;
      }

      // Move to confirmation step
      setConfirmationStep(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate authentication with the platform
      const result = await simulateAuth(platform);

      if (result.success) {
        // Create account data object
        const accountData = {
          ...values,
          platform,
          connected: true,
          connectedAt: new Date().toISOString(),
          profileUrl: `https://${platform}.com/${values.username}`,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.username)}&background=random`,
          verified: true,
          displayName: values.username, // Use username as display name
          accountId: values.username, // Use username as account ID
          accessToken: result.token, // Add token from authentication result
        };

        // Call the callback function to save the account
        onAccountAdded(platform, accountData);

        // Show success message
        toast.success(`${name} account connected successfully`);
      } else {
        toast.error(`Failed to connect to ${name}`);
      }
    } catch (error) {
      console.error(`Error connecting ${platform} account:`, error);
      toast.error(`Failed to connect to ${name}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          <CardTitle>Connect {name}</CardTitle>
        </div>
        <CardDescription>
          Enter your {name} account details to connect
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!confirmationStep ? (
              // Step 1: Account details
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder={`Your ${name} username`} {...field} />
                      </FormControl>
                      <FormDescription>
                        Your {name} username without the @ symbol
                      </FormDescription>
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
                          type="password"
                          placeholder={`Your ${name} password`}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your {name} account password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {credentialError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {credentialError}
                    </AlertDescription>
                  </Alert>
                )}

                {credentialsVerified && (
                  <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {name} credentials verified successfully
                    </AlertDescription>
                  </Alert>
                )}



                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email address"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send a confirmation code to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmation Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the 6-digit code"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the confirmation code sent to your email
                      </FormDescription>
                      <FormMessage />
                      <div className="flex flex-col gap-2 mt-2">
                        {!credentialsVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={verifyCredentials}
                            disabled={verifyingCredentials}
                          >
                            {verifyingCredentials ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying Credentials...
                              </>
                            ) : (
                              <>
                                Verify {name} Credentials
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant={credentialsVerified ? "default" : "outline"}
                          className="w-full"
                          onClick={sendConfirmationCode}
                          disabled={sendingCode || (!credentialsVerified && !verifyingCredentials)}
                        >
                          {sendingCode ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : codeSent ? (
                            <>
                              Resend Code
                            </>
                          ) : (
                            <>
                              Send Confirmation Code
                            </>
                          )}
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />


              </>
            ) : (
              // Step 2: Account verification
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Account Details</h3>
                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{form.getValues('username')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{form.getValues('email')}</span>
                    </div>


                  </div>
                </div>



                <FormField
                  control={form.control}
                  name="confirmationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmation Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the 6-digit code"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the confirmation code sent to {form.getValues('email')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || sendingCode || uploadingVideo}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : uploadingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Video...
                </>
              ) : sendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : confirmationStep ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Complete Account Connection
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Verify & Continue
                </>
              )}
            </Button>

            {confirmationStep && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setConfirmationStep(false)}
              >
                Back to Account Details
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SocialAccountForm;
