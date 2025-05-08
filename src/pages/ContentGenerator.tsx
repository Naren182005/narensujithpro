import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Linkedin, Instagram, Facebook, Youtube,
  Sparkles, Send, Save, ArrowLeft, Loader2,
  Copy, Download, Share2, Calendar
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { content } from '@/lib/api-client';
import { handleError } from '@/lib/error-handler';
import config from '@/config';

// Platform configuration
const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
];

const ContentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [activeTab, setActiveTab] = useState<string>('linkedin');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<Record<string, string | null>>({
    linkedin: null,
    instagram: null,
    youtube: null,
  });
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({
    linkedin: false,
    instagram: false,
    youtube: false,
  });
  const [youtubeTitle, setYoutubeTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load content if editing
  useEffect(() => {
    if (editId) {
      setIsEditing(true);

      // In a real app, this would be an API call
      // const fetchContent = async () => {
      //   try {
      //     const response = await content.getDraft(editId);
      //     setPrompt(response.prompt);
      //     setGeneratedContent(response.content);
      //     if (response.platform === 'youtube' && response.title) {
      //       setYoutubeTitle(response.title);
      //     }
      //     setActiveTab(response.platform);
      //   } catch (error) {
      //     handleError(error);
      //   }
      // };
      // fetchContent();

      // Mock data for demonstration
      setPrompt('digital marketing strategies for small businesses');
      setGeneratedContent({
        linkedin: "📊 Transforming Your Digital Marketing Strategy: Key Insights for 2023\n\nAre you leveraging the full potential of your digital marketing approach? Recent studies show that businesses implementing strategic digital marketing see 3.5x higher engagement rates.\n\nKey findings:\n• 78% of industry leaders prioritize digital marketing in their growth strategy\n• Companies with dedicated digital marketing teams report 45% higher ROI\n• Consistent digital marketing implementation leads to 67% better customer retention\n\nWhat's your biggest challenge with digital marketing? Share below!\n\n#DigitalMarketing #BusinessStrategy #GrowthHacking #ProfessionalDevelopment",
        instagram: "✨ Elevate Your Digital Marketing Game! ✨\n\nSwipe through for 5 game-changing tips that will transform your approach to digital marketing! 👉\n\nDid you know? Only 24% of brands are fully leveraging the power of digital marketing - be among the leaders! 📈\n\n💡 Tip #1: Start with clear goals\n💡 Tip #2: Analyze your audience deeply\n💡 Tip #3: Create consistent, quality content\n💡 Tip #4: Engage authentically with your community\n💡 Tip #5: Measure and adapt your strategy\n\nDouble tap if you're ready to level up your digital marketing strategy! 💪\n\nTag a friend who needs to see this! 👇\n\n#DigitalMarketing #StrategyTips #GrowthMindset #ContentCreation #DigitalMarketing",
        youtube: "In this video, we break down the 5 most effective digital marketing strategies that are transforming businesses in 2023.\n\n🔍 TIMESTAMPS:\n00:00 Introduction\n01:23 Strategy #1: Audience-First Approach\n04:56 Strategy #2: Content Optimization\n08:32 Strategy #3: Platform Specialization\n12:45 Strategy #4: Data-Driven Decision Making\n16:20 Strategy #5: Community Building\n20:15 Implementation Tips\n\nDownload our free digital marketing workbook: [LINK]\nJoin our digital marketing masterclass: [LINK]\n\nDon't forget to LIKE, SUBSCRIBE, and hit the NOTIFICATION BELL to stay updated with our latest content!",
      });
      setYoutubeTitle('5 Revolutionary Digital Marketing Strategies for Small Businesses in 2023');
      setActiveTab('linkedin');
    }
  }, [editId]);

  // Generate content for a platform
  const generateContent = async (platform: string) => {
    try {
      setIsGenerating(prev => ({ ...prev, [platform]: true }));

      if (!prompt.trim()) {
        toast.error('Please enter keywords to generate content');
        return;
      }

      // Make the actual API call to generate content
      console.log(`Calling API to generate content for ${platform} with keywords: ${prompt}`);
      const response = await content.generate(platform, prompt);
      console.log(`Received API response for ${platform}:`, response);

      if (platform === 'youtube' && typeof response === 'object' && response.title && response.description) {
        // Handle YouTube content which returns an object with title and description
        console.log(`Setting YouTube title: ${response.title}`);
        setYoutubeTitle(response.title || '');
        setGeneratedContent(prev => ({ ...prev, [platform]: response.description }));
      } else {
        // Handle other platforms that return a string
        console.log(`Setting content for ${platform}`);
        setGeneratedContent(prev => ({ ...prev, [platform]: response }));
      }

      toast.success(`Generated content for ${platform}`);

    } catch (error) {
      handleError(error);
      toast.error(`Failed to generate content for ${platform}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Generate content for all platforms
  const generateAllContent = async () => {
    try {
      if (!prompt.trim()) {
        toast.error('Please enter keywords to generate content');
        return;
      }

      // Set all platforms to generating state
      setIsGenerating({
        linkedin: true,
        instagram: true,
        youtube: true,
      });

      // Generate content for each platform with a slight delay between each
      for (const platform of platforms) {
        await generateContent(platform.id);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('Generated content for all platforms');
    } catch (error) {
      handleError(error);
      toast.error('Failed to generate content for some platforms');
    } finally {
      setIsGenerating({
        linkedin: false,
        instagram: false,
        youtube: false,
      });
    }
  };

  // Save content as draft
  const saveContent = async () => {
    try {
      setIsSaving(true);

      // In a real app, this would be an API call
      // const response = await content.saveDraft(activeTab, generatedContent[activeTab], activeTab === 'youtube' ? youtubeTitle : undefined);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Content saved successfully');

      // Navigate back to the content grid
      navigate('/grid');
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Post content
  const postContent = async () => {
    try {
      setIsSaving(true);

      // In a real app, this would be an API call
      // const response = await content.post(activeTab, generatedContent[activeTab], activeTab === 'youtube' ? youtubeTitle : undefined);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Content posted to ${activeTab}`);

      // Navigate back to the content grid
      navigate('/grid');
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Schedule content
  const scheduleContent = async () => {
    try {
      // Navigate to scheduling page
      navigate('/posts/schedule', {
        state: {
          platform: activeTab,
          content: generatedContent[activeTab],
          title: activeTab === 'youtube' ? youtubeTitle : undefined
        }
      });
    } catch (error) {
      handleError(error);
    }
  };

  // Copy content to clipboard
  const copyContent = async () => {
    try {
      const contentToCopy = activeTab === 'youtube' && youtubeTitle
        ? `${youtubeTitle}\n\n${generatedContent[activeTab]}`
        : generatedContent[activeTab];

      await navigator.clipboard.writeText(contentToCopy || '');
      toast.success('Content copied to clipboard');
    } catch (error) {
      handleError(error);
      toast.error('Failed to copy content');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/grid')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Edit Content' : 'Content Generator'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Enter keywords for content generation:</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., artificial intelligence, machine learning, data science"
                className="min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generateAllContent}
                disabled={!prompt.trim() || Object.values(isGenerating).some(Boolean)}
                className="flex-1"
              >
                {Object.values(isGenerating).every(Boolean) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate for All Platforms
                  </>
                )}
              </Button>

              <Button
                onClick={() => generateContent(activeTab)}
                disabled={!prompt.trim() || isGenerating[activeTab]}
                variant="outline"
                className="flex-1"
              >
                {isGenerating[activeTab] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate for {platforms.find(p => p.id === activeTab)?.name}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <Tabs defaultValue="linkedin" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList>
                {platforms.map(platform => (
                  <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-1">
                    {platform.icon}
                    <span className="hidden md:inline ml-1">{platform.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={copyContent} disabled={!generatedContent[activeTab]}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {platforms.map(platform => (
              <TabsContent key={platform.id} value={platform.id} className="p-0 m-0">
                <div className="p-4 space-y-4">
                  {platform.id === 'youtube' && (
                    <div className="space-y-2">
                      <Label htmlFor="youtube-title">Video Title</Label>
                      <Input
                        id="youtube-title"
                        placeholder="Enter video title"
                        value={youtubeTitle}
                        onChange={(e) => setYoutubeTitle(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`${platform.id}-content`}>
                      {platform.id === 'youtube' ? 'Video Description' : 'Post Content'}
                    </Label>
                    {isGenerating[platform.id] ? (
                      <div className="space-y-2">
                        <Skeleton className="h-[20px] w-full" />
                        <Skeleton className="h-[20px] w-[90%]" />
                        <Skeleton className="h-[20px] w-[95%]" />
                        <Skeleton className="h-[20px] w-[85%]" />
                        <Skeleton className="h-[20px] w-[90%]" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] rounded-md border">
                        <Textarea
                          id={`${platform.id}-content`}
                          placeholder={`Your ${platform.name} content will appear here...`}
                          value={generatedContent[platform.id] || ''}
                          onChange={(e) => setGeneratedContent(prev => ({ ...prev, [platform.id]: e.target.value }))}
                          className="min-h-[300px] border-0 focus-visible:ring-0 resize-none"
                        />
                      </ScrollArea>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border-t">
                  <Button variant="outline" onClick={saveContent} disabled={!generatedContent[platform.id] || isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={scheduleContent}
                      disabled={!generatedContent[platform.id]}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>

                    <Button
                      onClick={postContent}
                      disabled={!generatedContent[platform.id] || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Post Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ContentGenerator;
