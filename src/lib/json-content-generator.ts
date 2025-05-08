import { toast } from '@/components/ui/sonner';
import { handleError } from '@/lib/error-handler';
import axios from 'axios';
import config from '@/config';

/**
 * Generates social media content for multiple platforms in JSON format using Llama model
 * @returns JSON object with content for LinkedIn, Instagram, and Facebook
 */
export async function generateJsonContent(): Promise<any | null> {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Generating content for all platforms...');

    try {
      // Call the server API to generate JSON content
      const response = await axios.get(`${config.apiBaseUrl}/generate-json-content`);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.data) {
        throw new Error('Failed to generate content - empty response');
      }

      toast.success('Content generated for all platforms');
      return response.data;
    } catch (apiError) {
      console.error('Error calling API:', apiError);
      toast.dismiss(loadingToast);
      throw apiError;
    }
  } catch (error) {
    handleError(error, { context: 'json-content-generation' });
    toast.error('Failed to generate content');
    return null;
  }
}
