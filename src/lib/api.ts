// API service for interacting with the backend
import config from '@/config';

/**
 * Generate content for a specific platform
 * @param platform The platform to generate content for (linkedin, instagram, twitter, facebook, youtube, common)
 * @param prompt Optional custom prompt to guide content generation
 * @returns The generated content
 */
export async function generateContent(platform: string, prompt: string = '') {
  try {
    console.log(`=== API.TS: START GENERATE CONTENT FOR ${platform.toUpperCase()} ===`);
    console.log(`API.ts: Generating content for ${platform}`);
    console.log(`API.ts: Received prompt: "${prompt}"`);
    console.log(`API.ts: Prompt length: ${prompt.length} characters`);

    // Validate platform
    const validPlatforms = ['linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'common'];
    if (!validPlatforms.includes(platform)) {
      console.error(`API.ts: Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`);
      throw new Error(`Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`);
    }
    console.log(`API.ts: Platform ${platform} is valid`);

    // Create request body with platform and prompt
    const requestBody = { platform, prompt };
    console.log(`API.ts: Created request body:`, requestBody);
    console.log(`API.ts: Request body stringified:`, JSON.stringify(requestBody));

    // Get the API base URL from config
    const apiUrl = config.apiBaseUrl || 'http://localhost:3001/api';
    // Ensure we don't duplicate the /api part
    const fullUrl = apiUrl.endsWith('/generate') ? apiUrl : `${apiUrl}/generate`;

    console.log(`API.ts: Sending request to: ${fullUrl}`);
    console.log(`API.ts: Request method: POST`);
    console.log(`API.ts: Request headers: Content-Type: application/json`);
    console.log(`API.ts: Request body: ${JSON.stringify(requestBody)}`);

    // Make the API request with the full URL
    console.log(`API.ts: Executing fetch request...`);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`API.ts: Received response with status: ${response.status} ${response.statusText}`);
    console.log(`API.ts: Response headers:`, Object.fromEntries([...response.headers.entries()]));

    // Handle error responses
    if (!response.ok) {
      console.error(`API.ts: Response not OK. Status: ${response.status} ${response.statusText}`);
      let errorMessage = `Error generating content: ${response.status} ${response.statusText}`;

      try {
        console.log(`API.ts: Attempting to parse error response as JSON...`);
        const errorData = await response.json();
        console.log(`API.ts: Parsed error data:`, errorData);
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
          console.log(`API.ts: Error message from server: ${errorMessage}`);
        }
      } catch (e) {
        console.error(`API.ts: Could not parse error as JSON:`, e);
        // If we can't parse the error as JSON, try to get the text
        try {
          console.log(`API.ts: Attempting to get error response as text...`);
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
            console.log(`API.ts: Error text from server: ${errorText}`);
          }
        } catch (textError) {
          console.error(`API.ts: Could not read error response text:`, textError);
        }
      }

      console.error(`API.ts: Server error response: ${errorMessage}`);
      console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
      throw new Error(errorMessage);
    }

    // Parse the response
    let data;
    try {
      console.log(`API.ts: Parsing response as JSON...`);
      data = await response.json();
      console.log(`API.ts: Parsed response data:`, data);
      console.log(`API.ts: Response data type: ${typeof data}`);
      if (data.content) {
        console.log(`API.ts: Content type: ${typeof data.content}`);
        console.log(`API.ts: Content preview: ${typeof data.content === 'string' ? data.content.substring(0, 100) + '...' : JSON.stringify(data.content).substring(0, 100) + '...'}`);
      }
    } catch (e) {
      console.error(`API.ts: Error parsing response JSON:`, e);
      console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
      throw new Error('Invalid JSON response from server');
    }

    // Validate the response data
    if (!data) {
      console.error(`API.ts: Invalid response format:`, data);
      console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
      throw new Error('Invalid response format from server');
    }

    // Check if the response has a content property
    if (data.content !== undefined) {
      console.log(`API.ts: Successfully received content for ${platform}`);
      console.log(`API.ts: Content type: ${typeof data.content}`);
      console.log(`API.ts: Content length: ${typeof data.content === 'string' ? data.content.length : JSON.stringify(data.content).length} characters`);
      console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} ===`);
      return data.content;
    } else {
      // If there's no content property, return the entire data object
      // This handles cases where the API returns the content directly
      console.log(`API.ts: No content property found, returning entire data object`);
      console.log(`API.ts: Data type: ${typeof data}`);
      console.log(`API.ts: Data length: ${JSON.stringify(data).length} characters`);
      console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} ===`);
      return data;
    }
  } catch (error) {
    console.error(`API.ts: Error generating content:`, error);
    console.log(`=== API.TS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
    throw error;
  }
}

/**
 * Post content to a specific platform
 * @param platform The platform to post to (linkedin, instagram, twitter, facebook, youtube)
 * @param content The content to post
 * @returns The result of the post operation
 */
export async function postContent(platform: string, content: any) {
  try {
    // Get the API base URL from config
    const apiUrl = config.apiBaseUrl || 'http://localhost:3001/api';
    // Ensure we don't duplicate the /api part
    const fullUrl = apiUrl.endsWith('/post') ? apiUrl : `${apiUrl}/post`;

    console.log('Sending post request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, content }),
    });

    if (!response.ok) {
      throw new Error(`Error posting content: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting content:', error);
    throw error;
  }
}
