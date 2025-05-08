
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Youtube, Send, Upload, Video, X } from 'lucide-react';
import { GenerateButton } from './GenerateButton';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface YouTubeSectionProps {
  title: string;
  description: string;
  tags: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onTagsChange: (tags: string) => void;
  onGenerateContent: () => void;
  onPostToYouTube: () => void;
  isGenerating: boolean;
  className?: string;
}

export const YouTubeSection: React.FC<YouTubeSectionProps> = ({
  title,
  description,
  tags,
  onTitleChange,
  onDescriptionChange,
  onTagsChange,
  onGenerateContent,
  onPostToYouTube,
  isGenerating,
  className,
}) => {
  // State for video upload
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle video file selection
  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    setVideoFile(file);

    // Create a preview URL
    const fileUrl = URL.createObjectURL(file);
    setVideoPreview(fileUrl);

    // Set video title to file name if not already set
    if (!title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      onTitleChange(fileName);
    }

    toast.success('Video selected successfully');
  };

  // Clear selected video
  const clearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className={cn(
      'glass-card rounded-2xl p-5 transition-all duration-300 mt-6',
      'youtube-card border border-red-500/20',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="h-5 w-5 text-youtube" />
        <h3 className="font-semibold text-youtube">YouTube</h3>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnail Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="animate-fade-in">
          <div className="space-y-4">
            {/* Video Upload Box */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Video className="h-5 w-5 text-youtube" />
                Upload Video
              </h3>

              {!videoPreview ? (
                <div className="mt-2">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition-colors">
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, or AVI (max. 100MB)</p>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  <div className="relative rounded-md overflow-hidden border">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-auto max-h-[200px]"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                      onClick={clearVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{videoFile?.name}</p>
                    <p className="text-muted-foreground">
                      {videoFile && (videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="youtube-title" className="text-sm font-medium mb-1 block">Title</label>
              <Input
                id="youtube-title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div>
              <label htmlFor="youtube-description" className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                id="youtube-description"
                placeholder="Enter video description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="resize-none min-h-[100px] bg-background/50"
              />
            </div>
            <div>
              <label htmlFor="youtube-tags" className="text-sm font-medium mb-1 block">Tags</label>
              <Input
                id="youtube-tags"
                placeholder="Enter comma separated tags"
                value={tags}
                onChange={(e) => onTagsChange(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="animate-fade-in space-y-4">
          <p className="text-sm text-muted-foreground">
            Optimize your video's metadata for better visibility. Include relevant keywords, a compelling description,
            and tags that align with your content. This helps YouTube understand what your video is about.
          </p>
          <div className="bg-secondary/30 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Metadata Tips:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Use your primary keyword in the title</li>
              <li>Write a detailed description (300+ words)</li>
              <li>Include timestamps for longer videos</li>
              <li>Add 5-8 relevant tags</li>
              <li>Link to related content or website</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="thumbnails" className="animate-fade-in space-y-4">
          <p className="text-sm text-muted-foreground">
            Create eye-catching thumbnails that stand out. Your thumbnail should accurately represent your video content
            while being visually appealing to potential viewers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Design Ideas:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Use contrasting colors</li>
                <li>Include a close-up of your face</li>
                <li>Add clear, large text (3-5 words)</li>
                <li>Use high-quality images</li>
                <li>Create a consistent brand style</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Avoid These Mistakes:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Cluttered designs with too many elements</li>
                <li>Clickbait that doesn't match content</li>
                <li>Poor image quality or resolution</li>
                <li>Text that's too small to read</li>
                <li>Using copyrighted images</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          onClick={() => {
            if (!videoFile) {
              toast.error('Please upload a video first');
              return;
            }

            if (!title) {
              toast.error('Please enter a title for your video');
              return;
            }

            setIsUploading(true);

            // Simulate upload delay
            setTimeout(() => {
              setIsUploading(false);
              onPostToYouTube();
              toast.success('Video uploaded successfully');
            }, 2000);
          }}
          className="group w-full"
          disabled={isGenerating || isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-1">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1" />
              Uploading Video...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Send className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
              Post to YouTube
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
