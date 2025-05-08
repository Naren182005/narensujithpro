// Test script for Groq API integration
require('dotenv').config();
const axios = require('axios');

// Get API key from environment variables
const apiKey = process.env.GROQ_API_KEY;

async function testGroqAPI() {
  try {
    console.log('Testing Groq API with Llama 4...');

    if (!apiKey) {
      console.error('Error: GROQ_API_KEY not found in environment variables');
      return;
    }

    console.log(`Using API key: ${apiKey.substring(0, 5)}...`);

    // Sample text to summarize
    const text = `
    Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to human or animal intelligence.
    AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives
    its environment and takes actions that maximize its chance of achieving its goals.

    The term "artificial intelligence" had previously been used to describe machines that mimic and display "human"
    cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition
    has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally,
    which does not limit how intelligence can be articulated.

    AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon,
    and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or
    creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game
    systems (such as chess and Go).

    As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the
    definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently
    excluded from things considered to be AI, having become a routine technology.
    `;

    console.log('Text to summarize:', text.substring(0, 100) + '...');

    // Make request to Groq API
    console.log('Sending request to Groq API...');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text accurately and concisely.' },
          { role: 'user', content: `Please summarize the following text in a concise manner. The summary should be between 50 and 100 words.\n\nText to summarize:\n${text}\n\nSummary:` }
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

    console.log('\nGenerated Summary:');
    console.log('=================');
    console.log(summary);
    console.log('=================');

    console.log('\nTest completed successfully!');

    // Return additional information about the response
    console.log('\nResponse Metadata:');
    console.log('Model used:', response.data.model);
    console.log('Completion tokens:', response.data.usage.completion_tokens);
    console.log('Prompt tokens:', response.data.usage.prompt_tokens);
    console.log('Total tokens:', response.data.usage.total_tokens);

  } catch (error) {
    console.error('Error testing Groq API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
console.log('Starting Groq API test...');
testGroqAPI();
