// Groq API integration service for Llama model
require('dotenv').config();
const axios = require('axios');

// Get API key from environment variables or use the provided key
const apiKey = process.env.GROQ_API_KEY || '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';

/**
 * Summarize text using Groq's Llama model
 * @param {string} text - The text to summarize
 * @param {Object} options - Options for summarization
 * @param {number} options.maxLength - Maximum length of the summary (default: 200)
 * @param {number} options.minLength - Minimum length of the summary (default: 50)
 * @returns {Promise<string>} - The summarized text
 */
async function summarizeText(text, options = {}) {
  try {
    console.log('Groq Service: Summarizing text...');

    // Set default options
    const maxLength = options.maxLength || 200;
    const minLength = options.minLength || 50;

    if (!apiKey) {
      throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file.');
    }

    // Create the prompt for summarization
    const prompt = `
    Please summarize the following text in a concise manner.
    The summary should be between ${minLength} and ${maxLength} words.

    Text to summarize:
    ${text}

    Summary:`;

    // Make request to Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text accurately and concisely.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the summary from the response
    const summary = response.data.choices[0].message.content.trim();
    console.log('Groq Service: Successfully generated summary');

    return summary;
  } catch (error) {
    console.error('Groq summarization error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to summarize text: ${error.message}`);
  }
}

/**
 * Generate social media content using Groq's Llama model
 * @param {string} platform - The platform to generate content for (linkedin, instagram, youtube)
 * @param {string} keywords - Keywords to use for content generation
 * @returns {Promise<string|object>} - The generated content
 */
async function generateContent(platform, keywords) {
  try {
    console.log(`=== GROQ-SERVICE.JS: START GENERATE CONTENT FOR ${platform.toUpperCase()} ===`);
    console.log(`GROQ-SERVICE.js: Generating content for platform: "${platform}"`);
    console.log(`GROQ-SERVICE.js: Using prompt: "${keywords}"`);
    console.log(`GROQ-SERVICE.js: Prompt length: ${keywords ? keywords.length : 0} characters`);

    if (!apiKey) {
      console.error(`GROQ-SERVICE.js: Groq API key is not configured`);
      console.log(`=== GROQ-SERVICE.JS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
      throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file.');
    }
    console.log(`GROQ-SERVICE.js: Using Groq API key: ${apiKey.substring(0, 10)}...`);

    // Validate platform
    const validPlatforms = ['linkedin', 'instagram', 'facebook', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      console.error(`GROQ-SERVICE.js: Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`);
      console.log(`=== GROQ-SERVICE.JS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
      throw new Error(`Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`);
    }
    console.log(`GROQ-SERVICE.js: Platform ${platform} is valid`);

    // Log the API key and model being used
    console.log(`GROQ-SERVICE.js: Using Llama model: llama-3.1-8b-instant`);
    console.log(`GROQ-SERVICE.js: API endpoint: https://api.groq.com/openai/v1/chat/completions`);

    // Create platform-specific system prompts
    let systemPrompt = '';
    let userPrompt = '';

    // Use the entire prompt as provided by the user
    const promptText = keywords.trim();
    console.log(`GROQ-SERVICE.js: Trimmed prompt: "${promptText}"`);

    console.log(`GROQ-SERVICE.js: Creating platform-specific prompts for ${platform}`);
    switch (platform) {
      case 'linkedin':
        console.log(`GROQ-SERVICE.js: Creating LinkedIn-specific prompts`);
        systemPrompt = 'You are a professional content creator specializing in LinkedIn posts. Create engaging, professional content that resonates with a business audience. Focus on providing value, insights, and thought leadership.';
        userPrompt = `Create a professional LinkedIn post about: "${promptText}".

        IMPORTANT INSTRUCTIONS:
        1. The post MUST be centered around the exact prompt provided.
        2. The post should be informative, include some data points or insights specific to the prompt.
        3. End with a question to encourage engagement.
        4. Include relevant hashtags based on the prompt.
        5. If the prompt mentions specific locations, people, events, or industries, focus on those details.`;
        break;
      case 'instagram':
        console.log(`GROQ-SERVICE.js: Creating Instagram-specific prompts`);
        systemPrompt = 'You are a creative content creator specializing in Instagram captions. Create engaging, visually-descriptive content that resonates with a diverse audience. Use emojis appropriately and include relevant hashtags.';
        userPrompt = `Create an engaging Instagram caption about: "${promptText}".

        IMPORTANT INSTRUCTIONS:
        1. The caption MUST be centered around the exact prompt provided.
        2. The caption should be attention-grabbing, include emojis, and have a conversational tone.
        3. Include a call to action and relevant hashtags based on the prompt.
        4. If the prompt mentions specific locations, people, events, or industries, focus on those details.`;
        break;
      case 'facebook':
        console.log(`GROQ-SERVICE.js: Creating Facebook-specific prompts`);
        systemPrompt = 'You are a social media content creator specializing in Facebook posts. Create engaging, shareable content that resonates with a broad audience and encourages interaction.';
        userPrompt = `Create an engaging Facebook post about: "${promptText}".

        IMPORTANT INSTRUCTIONS:
        1. The post MUST be centered around the exact prompt provided.
        2. The post should be conversational yet informative, with a mix of personal insights and factual information.
        3. Include a question or call to action to encourage comments and shares.
        4. If appropriate, include 2-3 relevant hashtags (not too many for Facebook).
        5. If the prompt mentions specific locations, people, events, or industries, focus on those details.
        6. Keep the tone friendly and accessible to a general audience.`;
        break;
      case 'youtube':
        console.log(`GROQ-SERVICE.js: Creating YouTube-specific prompts and calling generateYouTubeContent`);
        systemPrompt = 'You are a video content creator specializing in YouTube descriptions. Create detailed, SEO-friendly descriptions that help viewers understand what the video is about and encourage them to watch.';
        userPrompt = `Create a YouTube video description about: "${promptText}".

        IMPORTANT INSTRUCTIONS:
        1. The description MUST be centered around the exact prompt provided.
        2. Include a compelling introduction, key points covered in the video (with timestamps), and a call to action to subscribe.
        3. The content should be SEO-friendly and include keywords from the prompt.
        4. If the prompt mentions specific locations, people, events, or industries, focus on those details.`;
        console.log(`GROQ-SERVICE.js: Calling generateYouTubeContent with prompt: "${keywords}"`);
        return generateYouTubeContent(keywords);
      default:
        console.error(`GROQ-SERVICE.js: Unsupported platform: ${platform}`);
        console.log(`=== GROQ-SERVICE.JS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`GROQ-SERVICE.js: System prompt: "${systemPrompt}"`);
    console.log(`GROQ-SERVICE.js: User prompt: "${userPrompt}"`);
    console.log(`GROQ-SERVICE.js: Preparing request to Groq API...`);

    // Make request to Groq API
    console.log(`GROQ-SERVICE.js: Creating request payload...`);
    const requestPayload = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    };
    console.log(`GROQ-SERVICE.js: Request payload:`, requestPayload);

    console.log(`GROQ-SERVICE.js: Sending request to Groq API...`);
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      requestPayload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`GROQ-SERVICE.js: Received response from Groq API`);
    console.log(`GROQ-SERVICE.js: Response status: ${response.status}`);
    console.log(`GROQ-SERVICE.js: Response headers:`, response.headers);
    console.log(`GROQ-SERVICE.js: Response data:`, response.data);

    // Extract the content from the response
    console.log(`GROQ-SERVICE.js: Extracting content from response...`);
    const content = response.data.choices[0].message.content.trim();
    console.log(`GROQ-SERVICE.js: Content type: ${typeof content}`);
    console.log(`GROQ-SERVICE.js: Content length: ${content.length} characters`);
    console.log(`GROQ-SERVICE.js: Content preview: ${content.substring(0, 100)}...`);
    console.log(`GROQ-SERVICE.js: Successfully generated content for ${platform}`);
    console.log(`=== GROQ-SERVICE.JS: END GENERATE CONTENT FOR ${platform.toUpperCase()} ===`);

    return content;
  } catch (error) {
    console.error(`GROQ-SERVICE.js: Error generating content:`, error);
    console.error(`GROQ-SERVICE.js: Error message: ${error.message}`);

    if (error.response) {
      console.error(`GROQ-SERVICE.js: Response status:`, error.response.status);
      console.error(`GROQ-SERVICE.js: Response headers:`, error.response.headers);
      console.error(`GROQ-SERVICE.js: Response data:`, error.response.data);
    }

    console.log(`=== GROQ-SERVICE.JS: END GENERATE CONTENT FOR ${platform.toUpperCase()} WITH ERROR ===`);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generate YouTube content with title and description
 * @param {string} keywords - Keywords to use for content generation
 * @returns {Promise<object>} - Object containing title and description
 */
async function generateYouTubeContent(keywords) {
  try {
    console.log(`Groq Service: Generating YouTube content with keywords: ${keywords}`);

    console.log(`Using Groq API key for YouTube: ${apiKey.substring(0, 10)}...`);
    console.log(`Using Llama model for YouTube: llama-3.1-8b-instant`);
    console.log(`Keywords for YouTube: ${keywords}`);

    // Use the entire prompt as provided by the user
    const promptText = keywords.trim();

    const systemPrompt = 'You are a professional YouTube content creator specializing in creating engaging video titles, descriptions, and tags. Your content is optimized for YouTube search and designed to maximize click-through rates and viewer engagement.';
    const userPrompt = `Create a YouTube video title, description, and tags about: "${promptText}".

    IMPORTANT INSTRUCTIONS:
    1. The title, description, and tags MUST be centered around the exact prompt provided.
    2. The response should be in JSON format with the following structure:
    {
      "title": "The catchy, SEO-friendly YouTube title that includes key elements from the prompt",
      "description": "The detailed YouTube video description with timestamps, calls to action, etc. that focuses on the prompt",
      "tags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8"
    }

    3. Make the title specifically formatted for YouTube - catchy, clear, and including important keywords from the prompt. Use formats like "How to...", "Top 5...", or "Ultimate Guide to..." that perform well on YouTube.
    4. The description should be YouTube-optimized with an engaging introduction about the prompt, 5-7 timestamps with topics covered that relate directly to the prompt, relevant links, and a strong call to action to like, subscribe, and enable notifications.
    5. The tags should be comma-separated (with spaces after commas) and include 8-10 relevant keywords related to the prompt. Include a mix of broad and specific tags.
    6. If the prompt mentions specific locations, people, events, or industries, focus on those details.
    7. DO NOT mention LinkedIn, Instagram, Facebook or any other social media platform in the title or description - this is exclusively for YouTube content.`;

    console.log(`System prompt for YouTube: ${systemPrompt}`);
    console.log(`User prompt for YouTube: ${userPrompt}`);

    // Make request to Groq API for YouTube content
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Groq API response status for YouTube:', response.status);
    console.log('Groq API response headers for YouTube:', response.headers);

    // Extract the content from the response
    const content = JSON.parse(response.data.choices[0].message.content);
    console.log('Groq Service: Successfully generated YouTube content');

    return content;
  } catch (error) {
    console.error('Groq YouTube content generation error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    // If JSON parsing fails, return a default format
    return {
      title: `Complete YouTube Guide: ${keywords} Explained | Everything You Need to Know`,
      description: `This comprehensive video covers everything you need to know about ${keywords}.\n\n🔍 TIMESTAMPS:\n00:00 Welcome and Introduction\n01:45 What is ${keywords}?\n04:30 Why ${keywords} Matters\n08:15 How to Get Started with ${keywords}\n12:40 Advanced ${keywords} Techniques\n17:20 Common Mistakes to Avoid\n21:35 Future Trends in ${keywords}\n24:50 Conclusion and Next Steps\n\nUseful Resources:\n- Free ${keywords} Cheat Sheet: [LINK]\n- ${keywords} Community: [LINK]\n\nDon't forget to LIKE, SUBSCRIBE, and hit the NOTIFICATION BELL to stay updated with our latest videos!`,
      tags: `${keywords}, tutorial, guide, how-to, tips, tricks, explained, comprehensive, beginner, advanced`
    };
  }
}

module.exports = { summarizeText, generateContent };
