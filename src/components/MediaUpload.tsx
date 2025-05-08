
import React, { useState } from 'react';
import { Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MediaUploadProps {
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  platformName: string;
  supportedTypes: readonly ('image' | 'video')[];
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onImageUpload,
  onVideoUpload,
  platformName,
  supportedTypes
}) => {
  const [mediaPreview, setMediaPreview] = useState<{
    type: 'image' | 'video';
    url: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview({ type, url: previewUrl });
    
    if (type === 'image') {
      onImageUpload(file);
    } else {
      onVideoUpload(file);
    }
  };

  const handleClearPreview = () => {
    if (mediaPreview?.url) {
      URL.revokeObjectURL(mediaPreview.url);
    }
    setMediaPreview(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        {supportedTypes.includes('image') && (
          <div>
            <input
              type="file"
              id={`image-upload-${platformName}`}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
            />
            <label htmlFor={`image-upload-${platformName}`}>
              <Button
                variant="outline"
                size="sm"
                className="group"
                asChild
              >
                <span className="cursor-pointer">
                  <ImageIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                  Image
                </span>
              </Button>
            </label>
          </div>
        )}
        
        {supportedTypes.includes('video') && (
          <div>
            <input
              type="file"
              id={`video-upload-${platformName}`}
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="hidden"
            />
            <label htmlFor={`video-upload-${platformName}`}>
              <Button
                variant="outline"
                size="sm"
                className="group"
                asChild
              >
                <span className="cursor-pointer">
                  <VideoIcon className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                  Video
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>

      {mediaPreview && (
        <Card className="relative overflow-hidden rounded-md border border-border bg-background/50 mt-2">
          {mediaPreview.type === 'image' && (
            <img 
              src={mediaPreview.url} 
              alt="Preview" 
              className="w-full h-auto max-h-[200px] object-contain"
            />
          )}
          {mediaPreview.type === 'video' && (
            <video 
              src={mediaPreview.url} 
              controls 
              className="w-full h-auto max-h-[200px]"
            />
          )}
          <Button 
            onClick={handleClearPreview}
            variant="ghost" 
            size="icon"
            className="absolute top-1 right-1 bg-background/80 rounded-full hover:bg-background/90 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  );
};
