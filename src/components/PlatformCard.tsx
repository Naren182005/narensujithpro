
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MediaUpload } from './MediaUpload';
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
  Loader2,
  CheckCircle2
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
  };

  const handleVideoUpload = (file: File) => {
    console.log(`Uploading video for ${platform}:`, file);
    setUploadedMedia(prev => ({ ...prev, video: file }));
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden',
      'w-full max-w-sm mx-auto aspect-[5/6] flex flex-col', // Perfect square-like aspect ratio (slightly taller)
      `${platform}-card`,
      className
    )}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0",
              platform === 'linkedin' && "bg-blue-100 dark:bg-blue-900/30",
              platform === 'instagram' && "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
              platform === 'facebook' && "bg-blue-100 dark:bg-blue-900/30",
              platform === 'youtube' && "bg-red-100 dark:bg-red-900/30"
            )}>
              <Icon className={cn("h-6 w-6", colorClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-bold text-base truncate", colorClass)}>{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Create & publish</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            <MediaUpload
              platformName={platform}
              onImageUpload={handleImageUpload}
              onVideoUpload={handleVideoUpload}
              supportedTypes={platformMediaSupport[platform]}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <TabsList className="grid grid-cols-2 mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-9 flex-shrink-0">
            <TabsTrigger
              value="compose"
              className="flex items-center justify-center gap-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 transition-all duration-200 font-medium text-xs py-1.5"
            >
              <Wand2 className="h-3 w-3" />
              <span>Compose</span>
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className="flex items-center justify-center gap-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 transition-all duration-200 font-medium text-xs py-1.5"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 flex flex-col space-y-2 mt-0 h-full">
            <div className="relative flex-1 flex flex-col min-h-0">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex-shrink-0">
                Content for {name}
              </label>
              <div className="relative flex-1 min-h-0">
                <Textarea
                  value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-full min-h-[100px] max-h-[120px] resize-none border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
                {content && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                    {content.length}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 pt-3 border-t border-gray-200 dark:border-gray-600">
              {isGenerating && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Generating content...</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={isGenerating}
                  className="flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                      Generate
                    </>
                  )}
                </Button>
                <Button
                  onClick={onPostContent}
                  disabled={!content.trim()}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm",
                    platform === 'linkedin' && "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
                    platform === 'instagram' && "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white",
                    platform === 'facebook' && "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
                    platform === 'youtube' && "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  )}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Post
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="post" className="flex-1 flex flex-col space-y-2 mt-0 h-full">
            {/* Post Preview Header */}
            <div className="flex items-center justify-between flex-shrink-0 mb-1">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Post Preview</h4>
              {content && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready
                </span>
              )}
            </div>

            {/* Mock Social Media Post */}
            <div className={cn(
              "flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-0"
            )}>
              {/* Post Header */}
              <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0",
                  platform === 'linkedin' && "bg-blue-100 dark:bg-blue-900/30",
                  platform === 'instagram' && "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30",
                  platform === 'facebook' && "bg-blue-100 dark:bg-blue-900/30",
                  platform === 'youtube' && "bg-red-100 dark:bg-red-900/30"
                )}>
                  <Icon className={cn("h-5 w-5", colorClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">Your {name} Account</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Just now</div>
                </div>
              </div>

              {/* Post Content */}
              <div className="flex-1 p-3 min-h-0 overflow-auto">
                {content ? (
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
                    {content}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 flex-1 flex flex-col items-center justify-center">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium mb-1">No content yet</p>
                    <p className="text-xs">Switch to Compose tab</p>
                  </div>
                )}

                {/* Media Attachments */}
                {(uploadedMedia.image || uploadedMedia.video) && (
                  <div className="mt-2 space-y-2">
                    {uploadedMedia.image && (
                      <div className="relative group">
                        <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <div className="text-center p-2">
                            <Image className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500 font-medium truncate">{uploadedMedia.image.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {uploadedMedia.video && (
                      <div className="relative group">
                        <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
                          <div className="text-center p-2">
                            <Video className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500 font-medium truncate">{uploadedMedia.video.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Post Interactions */}
              {content && (
                <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Sparkles className="h-3 w-3" />
                        <span>Like</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <MessageSquare className="h-3 w-3" />
                        <span>Comment</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Send className="h-3 w-3" />
                        <span>Share</span>
                      </button>
                    </div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">
                      Ready
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
