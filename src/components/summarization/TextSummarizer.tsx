import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { summarizeText } from '@/lib/summarization-service';
import { Loader2, Copy, Check } from 'lucide-react';

/**
 * TextSummarizer component for summarizing long text using Llama 3.1 from Groq
 */
const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maxLength, setMaxLength] = useState<number>(200);
  const [minLength, setMinLength] = useState<number>(50);
  const [stats, setStats] = useState<{
    originalLength: number;
    summaryLength: number;
    reductionPercentage: number;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Handle summarization
   */
  const handleSummarize = async () => {
    if (!inputText || inputText.length < 100) {
      alert('Please enter at least 100 characters to summarize.');
      return;
    }

    setIsLoading(true);
    setSummary('');
    setStats(null);

    try {
      const result = await summarizeText(inputText, {
        maxLength,
        minLength,
      });

      if (result) {
        setSummary(result.summary);
        setStats({
          originalLength: result.original_length,
          summaryLength: result.summary_length,
          reductionPercentage: result.reduction_percentage,
        });
      }
    } catch (error) {
      console.error('Error summarizing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy summary to clipboard
   */
  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Clear all fields
   */
  const handleClear = () => {
    setInputText('');
    setSummary('');
    setStats(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Input Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Text to Summarize</CardTitle>
          <CardDescription>
            Enter the text you want to summarize (minimum 100 characters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your long text here..."
            className="min-h-[300px]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            Character count: {inputText.length}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full space-y-4">
            <div>
              <Label htmlFor="min-length">Minimum Length (words)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="min-length"
                  min={20}
                  max={100}
                  step={5}
                  value={[minLength]}
                  onValueChange={(value) => setMinLength(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{minLength}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="max-length">Maximum Length (words)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="max-length"
                  min={100}
                  max={500}
                  step={10}
                  value={[maxLength]}
                  onValueChange={(value) => setMaxLength(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{maxLength}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSummarize} disabled={isLoading || inputText.length < 100}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                'Summarize with Llama 3.1'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Output Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Generated summary using Llama 3.1 from Groq
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="bg-muted p-4 rounded-md min-h-[300px]">
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md min-h-[300px] flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Generating summary with Llama 3.1...</p>
                </div>
              ) : (
                <p>Summary will appear here</p>
              )}
            </div>
          )}
          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-primary/10 p-2 rounded-md">
                <p className="font-semibold">Original</p>
                <p>{stats.originalLength} chars</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-md">
                <p className="font-semibold">Summary</p>
                <p>{stats.summaryLength} chars</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-md">
                <p className="font-semibold">Reduction</p>
                <p>{stats.reductionPercentage}%</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!summary}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Summary
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TextSummarizer;
