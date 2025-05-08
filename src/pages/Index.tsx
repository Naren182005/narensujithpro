
import React, { useState, useEffect } from 'react';
import { PlatformCard } from '@/components/PlatformCard';
import { YouTubeSection } from '@/components/YouTubeSection';
import { UniversalControls } from '@/components/UniversalControls';
import { ThemeToggle } from '@/components/ThemeToggle';
import { generateContent as apiGenerateContent, postContent } from '@/lib/api';
import { postToSocialMedia, postToMultiplePlatforms } from '@/lib/social-api';
import { postWithAccount, postToMultipleWithAccounts, hasPlatformAccounts } from '@/lib/account-service';
import { toast } from '@/components/ui/sonner';
import { Sparkles, LogIn, AlertCircle, CheckCircle2, User, Loader2 } from 'lucide-react';
import config from '@/config';
import { SocialAuthPanel } from '@/components/SocialAuthPanel';
import { PlatformType } from '@/components/SocialAuthButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import SocialAccountsManager from '@/components/SocialAccountsManager';

// Platform names
const platformNames: Record<PlatformType, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

const Index = () => {
  // State for platform content
  const [linkedinContent, setLinkedinContent] = useState('');
  const [instagramContent, setInstagramContent] = useState('');
  const [facebookContent, setFacebookContent] = useState('');
  const [commonContent, setCommonContent] = useState('');

  // State for prompt
  const [prompt, setPrompt] = useState('');

  // State for YouTube content
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [youtubeTags, setYoutubeTags] = useState('');

  // State for YouTube section visibility
  const [youtubeOpen, setYoutubeOpen] = useState(false);

  // State for loading animations
  const [isGenerating, setIsGenerating] = useState(false);

  // State for social media authentication
  const [authStatus, setAuthStatus] = useState<Record<PlatformType, boolean>>({
    linkedin: false,
    instagram: false,
    facebook: false,
    youtube: false,
  });

  // State for posting
  const [isPosting, setIsPosting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Check if all platforms are authenticated
  const allAuthenticated = Object.values(authStatus).every(status => status);

  // Define platforms array
  const platforms: PlatformType[] = ['linkedin', 'instagram', 'facebook', 'youtube'];

  // Check if any platform is authenticated
  const anyAuthenticated = Object.values(authStatus).some(status => status);

  // Function to generate tags from prompt
  const generateTagsFromPrompt = (prompt: string): string => {
    // Split the prompt into words
    const words = prompt.split(/\s+/);

    // Filter out common words and keep only meaningful keywords
    const keywords = words.filter(word =>
      word.length > 3 &&
      !['and', 'the', 'for', 'with', 'that', 'this', 'from', 'about'].includes(word.toLowerCase())
    );

    // Add some generic YouTube tags
    const genericTags = ['tutorial', 'guide', 'how-to', 'tips', 'tricks', 'explained', 'comprehensive'];

    // Combine keywords and generic tags, remove duplicates, and limit to 8-10 tags
    const allTags = [...new Set([...keywords, ...genericTags])].slice(0, 10);

    // Join tags with commas and spaces
    return allTags.join(', ');
  };

  // Function to generate content for all platforms at once
  const generateAllContent = async () => {
    console.log(`=== INDEX.TSX: START GENERATE CONTENT FOR ALL PLATFORMS ===`);
    console.log(`Index.tsx: Current prompt state: "${prompt}"`);
    setIsGenerating(true);

    try {
      // Use the server API to generate content for all platforms
      console.log(`Index.tsx: Using server API for all platforms`);

      // Use the prompt from the state
      let promptText = prompt;

      // Log the prompt being used
      console.log(`Index.tsx: Using exact prompt: "${promptText}"`);
      console.log(`Index.tsx: Prompt length: ${promptText.length} characters`);

      // Call the API with the prompt to generate content for all platforms
      console.log(`Index.tsx: Calling apiGenerateContent with prompt: "${promptText}"`);

      // Create a new API endpoint for generating content for all platforms
      const response = await fetch(`${config.apiBaseUrl}/generate-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Index.tsx: Server API response received for all platforms:`, data);

      if (!data) {
        console.error(`Index.tsx: No content received`);
        throw new Error('Failed to generate content - empty response');
      }

      // Update state for each platform
      if (data.linkedin) {
        console.log(`Index.tsx: Setting LinkedIn content`);
        setLinkedinContent(data.linkedin);
      }

      if (data.instagram) {
        console.log(`Index.tsx: Setting Instagram content`);
        setInstagramContent(data.instagram);
      }

      if (data.facebook) {
        console.log(`Index.tsx: Setting Facebook content`);
        setFacebookContent(data.facebook);
      }

      // Handle YouTube content which is an object with title and description
      if (data.youtube) {
        console.log(`Index.tsx: Setting YouTube content`);

        if (typeof data.youtube === 'object' && data.youtube.title && data.youtube.description) {
          console.log(`Index.tsx: Setting YouTube title: ${data.youtube.title}`);
          console.log(`Index.tsx: Setting YouTube description: ${data.youtube.description}`);

          setYoutubeTitle(data.youtube.title);
          setYoutubeDescription(data.youtube.description);

          // Set tags if available
          if (data.youtube.tags) {
            console.log(`Index.tsx: Setting YouTube tags: ${data.youtube.tags}`);
            setYoutubeTags(data.youtube.tags);
          } else {
            // If no tags are provided, generate them from the prompt
            console.log(`Index.tsx: No tags provided, generating from prompt: ${prompt}`);
            const generatedTags = generateTagsFromPrompt(prompt);
            console.log(`Index.tsx: Generated tags: ${generatedTags}`);
            setYoutubeTags(generatedTags);
          }
        } else {
          console.warn(`Index.tsx: YouTube content is not in expected format:`, data.youtube);
        }
      }

      console.log(`Index.tsx: Content generation successful for all platforms`);
      toast.success(`Generated content for all platforms`);
      console.log(`=== INDEX.TSX: END GENERATE CONTENT FOR ALL PLATFORMS ===`);
    } catch (error) {
      console.error(`Index.tsx: Error generating content:`, error);
      console.error(`Index.tsx: Error details:`, error);
      toast.error(`Failed to generate content: ${error.message}`);
      console.log(`=== INDEX.TSX: END GENERATE CONTENT FOR ALL PLATFORMS WITH ERROR ===`);
    } finally {
      console.log(`Index.tsx: Setting isGenerating to false`);
      setIsGenerating(false);
    }
  };

  // Function to handle posting content to all platforms
  const handlePostToAll = async () => {
    // Check if authenticated with any platform or if there are any connected accounts
    const hasConnectedAccounts = platforms.some(platform => hasPlatformAccounts(platform));

    if (!anyAuthenticated && !hasConnectedAccounts) {
      setShowAuthDialog(true);
      return;
    }

    setIsPosting(true);

    try {
      // Create a map of platforms to content
      const platformsContent: Record<PlatformType, string | object> = {} as Record<PlatformType, string | object>;

      // Include platforms that have content and either are authenticated or have connected accounts
      if ((authStatus.linkedin || hasPlatformAccounts('linkedin')) && linkedinContent) {
        platformsContent.linkedin = linkedinContent;
      }

      if ((authStatus.instagram || hasPlatformAccounts('instagram')) && instagramContent) {
        platformsContent.instagram = instagramContent;
      }

      if ((authStatus.facebook || hasPlatformAccounts('facebook')) && facebookContent) {
        platformsContent.facebook = facebookContent;
      }


      if ((authStatus.youtube || hasPlatformAccounts('youtube')) && youtubeTitle && youtubeDescription) {
        platformsContent.youtube = {
          title: youtubeTitle,
          description: youtubeDescription,
          tags: youtubeTags
        };
      }

      // Check if there's any content to post
      if (Object.keys(platformsContent).length === 0) {
        toast.error('No content to post. Please generate content and connect to at least one platform.');
        return;
      }

      // Try posting with connected accounts first, then fall back to social auth
      let results;
      try {
        // Post using connected accounts
        results = await postToMultipleWithAccounts(platformsContent);
      } catch (accountError) {
        console.error('Error posting with connected accounts:', accountError);

        // Fall back to social auth if available
        if (anyAuthenticated) {
          results = await postToMultiplePlatforms(platformsContent);
        } else {
          throw accountError;
        }
      }

      // Count successful posts
      const successCount = Object.values(results).filter(result => result.success).length;

      if (successCount > 0) {
        toast.success(`Content posted to ${successCount} platform${successCount > 1 ? 's' : ''}`);
      } else {
        toast.error('Failed to post to any platform');
      }
    } catch (error) {
      console.error('Error posting to all platforms:', error);
      toast.error('Failed to post to all platforms');
    } finally {
      setIsPosting(false);
    }
  };

  // Function to generate YouTube content
  const generateYoutubeContent = async () => {
    console.log(`=== INDEX.TSX: START GENERATE YOUTUBE CONTENT ===`);
    setIsGenerating(true);

    try {
      if (!prompt.trim()) {
        toast.error('Please enter keywords to generate content');
        return;
      }

      console.log(`Index.tsx: Generating YouTube content with prompt: "${prompt}"`);

      // Call the API to generate YouTube content
      const response = await fetch(`${config.apiBaseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: 'youtube', prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate YouTube content: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Index.tsx: YouTube content generation response:`, data);

      if (!data || !data.content) {
        throw new Error('Failed to generate YouTube content - empty response');
      }

      // YouTube content is expected to be an object with title and description
      const youtubeContent = data.content;

      if (typeof youtubeContent === 'object' && youtubeContent.title && youtubeContent.description) {
        console.log(`Index.tsx: Setting YouTube title: ${youtubeContent.title}`);
        console.log(`Index.tsx: Setting YouTube description: ${youtubeContent.description}`);

        setYoutubeTitle(youtubeContent.title);
        setYoutubeDescription(youtubeContent.description);

        // Set tags if available
        if (youtubeContent.tags) {
          console.log(`Index.tsx: Setting YouTube tags from API: ${youtubeContent.tags}`);
          setYoutubeTags(youtubeContent.tags);
        } else {
          // If no tags are provided, generate them from the prompt
          console.log(`Index.tsx: No tags provided in API response, generating from prompt: ${prompt}`);
          const generatedTags = generateTagsFromPrompt(prompt);
          console.log(`Index.tsx: Generated tags: ${generatedTags}`);
          setYoutubeTags(generatedTags);
        }

        toast.success('Generated YouTube content');
      } else {
        console.error('Invalid YouTube content format:', youtubeContent);
        throw new Error('Invalid YouTube content format');
      }

      console.log(`=== INDEX.TSX: END GENERATE YOUTUBE CONTENT ===`);
    } catch (error) {
      console.error(`Index.tsx: Error generating YouTube content:`, error);
      toast.error(`Failed to generate YouTube content: ${error.message}`);
      console.log(`=== INDEX.TSX: END GENERATE YOUTUBE CONTENT WITH ERROR ===`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle posting YouTube content
  const handlePostToYouTube = async () => {
    // Check if authenticated with YouTube or if there are connected YouTube accounts
    const hasYouTubeAccounts = hasPlatformAccounts('youtube');

    if (!authStatus.youtube && !hasYouTubeAccounts) {
      setShowAuthDialog(true);
      return;
    }

    setIsPosting(true);

    try {
      // Check if there's content to post
      if (!youtubeTitle || !youtubeDescription) {
        toast.error('Please provide a title and description for your YouTube video');
        return;
      }

      const youtubeContent = {
        title: youtubeTitle,
        description: youtubeDescription,
        tags: youtubeTags
      };

      // Try posting with connected accounts first, then fall back to social auth
      let result;
      try {
        // Post using connected accounts
        if (hasYouTubeAccounts) {
          result = await postWithAccount('youtube', youtubeContent);
        } else {
          // Fall back to social auth
          result = await postToSocialMedia('youtube', youtubeContent);
        }
      } catch (accountError) {
        console.error('Error posting with connected account:', accountError);

        // Fall back to social auth if available
        if (authStatus.youtube) {
          result = await postToSocialMedia('youtube', youtubeContent);
        } else {
          throw accountError;
        }
      }

      if (result.success) {
        toast.success('Content posted to YouTube');
      } else {
        toast.error(`Failed to post to YouTube: ${result.error}`);
      }
    } catch (error) {
      console.error('Error posting to YouTube:', error);
      toast.error('Failed to post to YouTube');
    } finally {
      setIsPosting(false);
    }
  };

  // Handle authentication status change
  const handleAuthStatusChange = (status: Record<PlatformType, boolean>) => {
    setAuthStatus(status);
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Enhanced Header */}
      <header className="glass-card sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-4 py-3 mb-6 shadow-sm">
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">SocialMuse</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Social Media Content Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/20">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 pulse"></span>
              <span>AI Connected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/login'}
              className="gap-2 animated-button border-primary/20 hover:border-primary/40"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/account'}
              className="gap-2 animated-button border-primary/20 hover:border-primary/40"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4">
        {/* Main content */}
        <main className="space-y-6">
          {/* Authentication status indicator */}
          {anyAuthenticated ? (
            <div className="glass-card bg-green-500/5 border border-green-500/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300 fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Connected Accounts</h3>
                  <p className="text-xs text-muted-foreground">
                    Ready to post to {Object.entries(authStatus)
                      .filter(([_, value]) => value)
                      .map(([key, _]) => platformNames[key as PlatformType])
                      .join(', ')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthDialog(true)}
                className="animated-button border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Manage Connections
                </span>
              </Button>
            </div>
          ) : (
            <div className="glass-card bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-300 fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">No Connected Accounts</h3>
                  <p className="text-xs text-muted-foreground">Connect to social media platforms to enable posting</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthDialog(true)}
                className="animated-button border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/10"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Connect Accounts
                </span>
              </Button>
            </div>
          )}

          {/* Top bar with universal controls */}
          <UniversalControls
            onGenerateAllContent={generateAllContent}
            isGenerating={isGenerating || isPosting}
            className="sticky top-[72px] z-40"
            prompt={prompt}
            onPromptChange={setPrompt}
          />

          {/* Platform cards grid - more spacious layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <PlatformCard
              platform="linkedin"
              content={linkedinContent}
              onContentChange={setLinkedinContent}
              onPostContent={() => postContent('linkedin', linkedinContent)}
              isGenerating={isGenerating}
              className="fade-in"
            />
            <PlatformCard
              platform="instagram"
              content={instagramContent}
              onContentChange={setInstagramContent}
              onPostContent={() => postContent('instagram', instagramContent)}
              isGenerating={isGenerating}
              className="fade-in"
              style={{ animationDelay: '0.1s' }}
            />
            <PlatformCard
              platform="facebook"
              content={facebookContent}
              onContentChange={setFacebookContent}
              onPostContent={() => postContent('facebook', facebookContent)}
              isGenerating={isGenerating}
              className="fade-in"
              style={{ animationDelay: '0.2s' }}
            />
          </div>

          {/* YouTube section */}
          <YouTubeSection
            title={youtubeTitle}
            description={youtubeDescription}
            tags={youtubeTags}
            onTitleChange={setYoutubeTitle}
            onDescriptionChange={setYoutubeDescription}
            onTagsChange={setYoutubeTags}
            onGenerateContent={generateYoutubeContent}
            onPostToYouTube={handlePostToYouTube}
            isGenerating={isGenerating}
          />
        </main>

        {/* Footer */}
        <footer className="mt-10 text-center text-sm text-muted-foreground">
          <p className="mb-2">SocialMuse © 2025 - The ultimate social media content generator</p>
          <div className="flex justify-center gap-4">
            <a href="/login" className="hover:text-primary hover:underline">Login</a>
            <a href="/register" className="hover:text-primary hover:underline">Register</a>
            <a href="/account" className="hover:text-primary hover:underline">Account</a>
          </div>
        </footer>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Social Media Accounts</DialogTitle>
            <DialogDescription>
              Connect your social media accounts to post content directly from SocialMuse.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="oauth">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth">Quick Connect</TabsTrigger>
              <TabsTrigger value="accounts">Account Details</TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="py-4">
              <SocialAuthPanel onAuthStatusChange={handleAuthStatusChange} />
            </TabsContent>

            <TabsContent value="accounts" className="py-4">
              <SocialAccountsManager
                onAccountsChange={(accounts) => {
                  // Update connected status based on accounts
                  const newAuthStatus: Record<PlatformType, boolean> = {
                    linkedin: false,
                    instagram: false,
                    facebook: false,
                    youtube: false,
                  };

                  Object.entries(accounts).forEach(([platform, platformAccounts]) => {
                    newAuthStatus[platform as PlatformType] = platformAccounts.some(account => account.connected);
                  });

                  setAuthStatus(newAuthStatus);
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
