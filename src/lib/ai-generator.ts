import config from '@/config';
import { toast } from '@/components/ui/sonner';
import { handleError } from '@/lib/error-handler';

type Platform = 'linkedin' | 'instagram';

/**
 * Generates content for a specific platform using OpenAI API
 * @param platform The platform to generate content for
 * @param customPrompt Optional custom prompt to override the default
 * @returns The generated content or null if there was an error
 */
export async function generateContent(platform: Platform, customPrompt?: string): Promise<string | null> {
  try {
    // Check if we have an API key
    if (!config.googleApiKey) {
      toast.error('API key is not configured. Please add it in your settings.');
      return null;
    }

    const prompt = customPrompt || getPlatformPrompt(platform);
    
    // Show loading toast
    const loadingToast = toast.loading(`Generating content for ${platform}...`);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.googleApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    toast.success(`Content generated for ${platform}`);
    return content;
  } catch (error) {
    handleError(error, { context: 'ai-generation' });
    return null;
  }
}

/**
 * Gets the default prompt for a specific platform
 * @param platform The platform to get the prompt for
 * @returns The default prompt for the platform
 */
function getPlatformPrompt(platform: Platform): string {
  switch(platform) {
    case "linkedin":
      return "Write a professional, insightful post for LinkedIn about AI trends in 2025. Include 3-4 paragraphs with bullet points highlighting key trends. End with a thought-provoking question to encourage engagement.";
    case "instagram":
      return "Create a casual, engaging Instagram caption about AI trends in 2025. Add appropriate emojis throughout and include 5-7 relevant hashtags at the end. Keep it under 300 characters and make it visually appealing.";
    default:
      return `Write engaging content about AI trends in 2025 for ${platform}.`;
  }
}

/**
 * Attaches event listeners to generate buttons
 * This should be called after the DOM is loaded
 */
export function setupGenerateButtons(): void {
  document.querySelectorAll(".generate-button").forEach(button => {
    button.addEventListener("click", async () => {
      const platform = button.getAttribute('data-platform') as Platform;
      if (!platform) return;
      
      const content = await generateContent(platform);
      
      if (content) {
        const textarea = document.getElementById(`${platform}-textarea`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = content;
        }
      }
    });
  });
}
