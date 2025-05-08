import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Download, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateJsonContent } from '@/lib/json-content-generator';

interface JsonContentDisplayProps {
  className?: string;
}

export const JsonContentDisplay: React.FC<JsonContentDisplayProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('json');

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      // Use the client-side function to generate content
      const content = await generateJsonContent();
      if (content) {
        setJsonContent(content);
      }
    } catch (error) {
      console.error('Error generating JSON content:', error);
      toast.error('Failed to generate JSON content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    if (!jsonContent) return;

    const contentToCopy = JSON.stringify(jsonContent, null, 2);
    navigator.clipboard.writeText(contentToCopy)
      .then(() => toast.success('JSON content copied to clipboard'))
      .catch(() => toast.error('Failed to copy content'));
  };

  const handleDownloadContent = () => {
    if (!jsonContent) return;

    const contentToDownload = JSON.stringify(jsonContent, null, 2);
    const blob = new Blob([contentToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-media-content.json';
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('JSON content downloaded');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Social Media Content
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {jsonContent && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-4">
              <Textarea
                value={JSON.stringify(jsonContent, null, 2)}
                readOnly
                className="font-mono h-[300px] overflow-auto"
              />
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-4">
              <h3 className="text-lg font-semibold">{jsonContent.linkedin.title}</h3>
              <Textarea
                value={jsonContent.linkedin.content}
                readOnly
                className="h-[300px] overflow-auto"
              />
            </TabsContent>

            <TabsContent value="instagram" className="space-y-4">
              <h3 className="text-lg font-semibold">{jsonContent.instagram.title}</h3>
              <Textarea
                value={`${jsonContent.instagram.content}\n\n${jsonContent.instagram.hashtags}`}
                readOnly
                className="h-[300px] overflow-auto"
              />
            </TabsContent>

            <TabsContent value="facebook" className="space-y-4">
              <h3 className="text-lg font-semibold">{jsonContent.facebook.title}</h3>
              <Textarea
                value={jsonContent.facebook.content}
                readOnly
                className="h-[300px] overflow-auto"
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {jsonContent && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCopyContent}>
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </Button>
          <Button variant="outline" onClick={handleDownloadContent}>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default JsonContentDisplay;
