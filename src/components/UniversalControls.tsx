
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  Wand2,
  ClipboardCopy,
  Send,
  Check,
  Sparkles,
  Zap,
  Lightbulb,
  Brain,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UniversalControlsProps {
  onGenerateAllContent: () => void;
  isGenerating: boolean;
  className?: string;
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

export const UniversalControls: React.FC<UniversalControlsProps> = ({
  onGenerateAllContent,
  isGenerating,
  className,
  prompt,
  onPromptChange,
}) => {
  const { toast } = useToast();

  return (
    <div className={cn(
      'glass-card rounded-2xl p-4 md:p-6 flex flex-col gap-4',
      className
    )}>
      {/* Prompt input field and Generate button */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Enter your prompt here (e.g., 'create engaging social media content about AI trends')"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full text-base py-6 border-primary/20 focus:border-primary/50 transition-all duration-300"
          />
          {prompt && (
            <button
              onClick={() => onPromptChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear prompt"
            >
              <span className="sr-only">Clear</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <Button
          onClick={onGenerateAllContent}
          disabled={isGenerating || !prompt.trim()}
          className="md:w-auto w-full py-6 px-8 generate-button bg-gradient-to-r from-primary to-accent"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 spin" />
              <span className="button-text">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="button-text hidden xs:inline">Generate All Content</span>
              <span className="button-text xs:hidden">Generate</span>
            </>
          )}
        </Button>
      </div>

      {/* Description */}
      <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium">AI Content Generator</h3>
          <p className="text-xs text-muted-foreground">Enter a prompt above and click Generate to create content for all platforms</p>
        </div>
      </div>
    </div>
  );
};
