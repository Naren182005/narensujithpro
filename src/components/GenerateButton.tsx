import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  platform: string;
  onClick: () => void;
  isGenerating: boolean;
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  platform,
  onClick,
  isGenerating,
  className
}) => {
  return (
    <Button
      variant="outline"
      size="default"
      onClick={onClick}
      disabled={isGenerating}
      className={`generate-button ${className || ''}`}
      data-platform={platform}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Generate
        </>
      )}
    </Button>
  );
};

export default GenerateButton;
