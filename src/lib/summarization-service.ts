import config from '@/config';
import { toast } from '@/components/ui/sonner';
import { handleError } from '@/lib/error-handler';

/**
 * Interface for summarization options
 */
interface SummarizationOptions {
  maxLength?: number;
  minLength?: number;
}

/**
 * Interface for summarization response
 */
interface SummarizationResponse {
  summary: string;
  original_length: number;
  summary_length: number;
  reduction_percentage: number;
}

/**
 * Summarizes text using Llama 3.1 from Groq
 * @param text The text to summarize
 * @param options Optional parameters for summarization
 * @returns The summarized text and metadata
 */
export async function summarizeText(
  text: string,
  options: SummarizationOptions = {}
): Promise<SummarizationResponse | null> {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Summarizing text...');

    // Get the API base URL from config
    const apiUrl = config.apiBaseUrl || 'http://localhost:3001/api';
    // Ensure we don't duplicate the /api part
    const fullUrl = apiUrl.endsWith('/summarize') ? apiUrl : `${apiUrl}/summarize`;

    console.log('Sending summarization request to:', fullUrl);
    console.log(`Text length: ${text.length} characters`);

    // Make the API request
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        maxLength: options.maxLength,
        minLength: options.minLength,
      }),
    });

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize text');
    }

    // Parse the response
    const data = await response.json();

    // Show success toast
    toast.success(`Text summarized successfully! Reduced by ${data.reduction_percentage}%`);

    return data;
  } catch (error) {
    handleError(error, {
      message: 'Failed to summarize text',
      category: 'API',
      severity: 'error',
    });
    return null;
  }
}
