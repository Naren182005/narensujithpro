// Debug script to test the Gemini API directly
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    console.log(`Using API key: ${apiKey.substring(0, 5)}...`);
    
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Initialized GoogleGenerativeAI client');
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Created model instance');
    
    // Create a simple prompt
    const prompt = "Write a professional LinkedIn post about the importance of continuous learning in the tech industry.";
    console.log('Using prompt:', prompt);
    
    // Generate content
    console.log('Calling generateContent...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    
    // Get the generated text
    const generatedText = result.response.text();
    console.log('Extracted text from response');
    
    // Print the result
    console.log('\nGenerated Content:');
    console.log('=================');
    console.log(generatedText);
    console.log('=================');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
console.log('Starting Gemini API test...');
testGeminiAPI();
