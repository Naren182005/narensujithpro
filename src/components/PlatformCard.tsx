
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MediaUpload } from './MediaUpload';
import { GenerateButton } from './GenerateButton';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Wand2,
  Clipboard,
  Send,
  Sparkles,
  MessageSquare,
  Image,
  Video,
  Link as LinkIcon,
  Hash,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PlatformType = 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube';

interface PlatformCardProps {
  platform: PlatformType;
  content: string;
  onContentChange: (content: string) => void;
  onPostContent: () => void;
  isGenerating: boolean;
  className?: string;
}

const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

const platformColors = {
  linkedin: 'text-linkedin',
  instagram: 'text-instagram',
  twitter: 'text-twitter',
  facebook: 'text-facebook',
  youtube: 'text-youtube',
};

const platformNames = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

const platformPlaceholders = {
  linkedin: 'Write a professional post for your LinkedIn network...',
  instagram: 'Create an engaging caption for your Instagram post...',
  twitter: 'Compose a short, impactful tweet...',
  facebook: 'Share an update with your Facebook friends...',
  youtube: 'Write a description for your YouTube video...',
};

const platformMediaSupport: Record<PlatformType, readonly ('image' | 'video')[]> = {
  linkedin: ['image', 'video'] as const,
  instagram: ['image', 'video'] as const,
  twitter: ['image', 'video'] as const,
  facebook: ['image', 'video'] as const,
  youtube: ['video'] as const,
};

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  content,
  onContentChange,
  onPostContent,
  isGenerating,
  className,
}) => {
  const Icon = platformIcons[platform];
  const colorClass = platformColors[platform];
  const name = platformNames[platform];
  const placeholder = platformPlaceholders[platform];

  const [uploadedMedia, setUploadedMedia] = useState<{
    image?: File;
    video?: File;
  }>({});

  const [activeTab, setActiveTab] = useState('compose');

  const handleImageUpload = (file: File) => {
    console.log(`Uploading image for ${platform}:`, file);
    setUploadedMedia(prev => ({ ...prev, image: file }));
    // Here you would typically upload the file to your backend
  };

  const handleVideoUpload = (file: File) => {
    console.log(`Uploading video for ${platform}:`, file);
    setUploadedMedia(prev => ({ ...prev, video: file }));
    // Here you would typically upload the file to your backend
  };

  return (
    <div className={cn(
      'glass-card rounded-2xl p-6 platform-card',
      `${platform}-card`,
      className
    )}>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className={cn("h-6 w-6", colorClass)} />
          </div>
          <h3 className={cn("font-semibold text-lg", colorClass)}>{name}</h3>
        </div>
        <MediaUpload
          platformName={platform}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          supportedTypes={platformMediaSupport[platform]}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="compose" className="text-sm py-2 tab-transition">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Write</span>
          </TabsTrigger>
          <TabsTrigger value="post" className="text-sm py-2 tab-transition">
            <Send className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Preview & Post</span>
            <span className="sm:hidden">Post</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="flex-1 flex flex-col space-y-3 mt-0 fade-in">
          <div className="relative flex-1 flex flex-col">
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={placeholder}
              className="content-textarea bg-background/50 p-4 md:p-6 flex-1"
            />
            {content && (
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
                {content.length} characters
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-auto pt-3 border-t border-border/50 justify-between button-container">
            <div>
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground pulse">
                  <Loader2 className="h-5 w-5 spin" />
                  <span>Generating content...</span>
                </div>
              )}
            </div>
            <Button
              onClick={onPostContent}
              className="post-button bg-gradient-to-r from-primary to-accent hover:shadow-lg animated-button"
              disabled={!content.trim()}
            >
              <Send className="h-5 w-5 mr-2 post-icon transition-transform duration-300" />
              <span className="button-text">Post to {name}</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="post" className="flex-1 flex flex-col space-y-3 mt-0 fade-in">
          <div className="bg-background/30 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className={cn("h-6 w-6", colorClass)} />
              </div>
              <div className="flex-1 w-full">
                <div className="font-medium text-base flex items-center gap-2">
                  <span>Your {name} Post</span>
                  {content && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Ready to publish</span>}
                </div>
                <div className="text-base mt-2 whitespace-pre-wrap leading-relaxed bg-background/50 p-3 rounded-md border border-border/30 max-h-[200px] overflow-y-auto">
                  {content || <span className="text-muted-foreground italic">No content yet. Switch to Compose tab to create content.</span>}
                </div>

                {uploadedMedia.image && (
                  <div className="mt-3 relative">
                    <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center border border-border/30 hover:border-primary/30 transition-colors">
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <span className="ml-2 text-xs text-muted-foreground">{uploadedMedia.image.name}</span>
                    </div>
                  </div>
                )}

                {uploadedMedia.video && (
                  <div className="mt-3 relative">
                    <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center border border-border/30 hover:border-primary/30 transition-colors">
                      <Video className="h-6 w-6 text-muted-foreground" />
                      <span className="ml-2 text-xs text-muted-foreground">{uploadedMedia.video.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  <button className="flex items-center gap-1 bg-background/80 hover:bg-background transition-colors px-2 py-1 rounded-md">
                    <Image className="h-3 w-3" />
                    <span>Add Media</span>
                  </button>
                  <button className="flex items-center gap-1 bg-background/80 hover:bg-background transition-colors px-2 py-1 rounded-md">
                    <LinkIcon className="h-3 w-3" />
                    <span>Add Link</span>
                  </button>
                  <button className="flex items-center gap-1 bg-background/80 hover:bg-background transition-colors px-2 py-1 rounded-md">
                    <Hash className="h-3 w-3" />
                    <span>Add Hashtags</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Post Settings</span>
              <span className="text-xs text-primary cursor-pointer hover:underline">Advanced options</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-background/30 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs font-medium">Schedule Post</span>
                </div>
              </div>
              <div className="bg-background/30 p-3 rounded-lg hover:bg-background/50 transition-colors cursor-pointer border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs font-medium">Audience Settings</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onPostContent}
            className="mt-auto animated-button text-base py-6 bg-gradient-to-r from-primary to-accent"
            disabled={!content.trim()}
          >
            <Send className="h-5 w-5 mr-2 post-icon transition-transform duration-300" />
            <span className="button-text">Post to {name}</span>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
