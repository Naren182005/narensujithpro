// Test script for chatgpt-service.js
const { generateWithChatGPT } = require('./server/chatgpt-service');

async function testGenerate() {
  try {
    console.log('Testing generateWithChatGPT function...');
    
    // Test LinkedIn generation
    console.log('\nTesting LinkedIn generation:');
    const linkedinContent = await generateWithChatGPT('linkedin', 'digital marketing');
    console.log('LinkedIn content:', linkedinContent.substring(0, 100) + '...');
    
    // Test YouTube generation
    console.log('\nTesting YouTube generation:');
    const youtubeContent = await generateWithChatGPT('youtube', 'content creation');
    console.log('YouTube title:', youtubeContent.title);
    console.log('YouTube description preview:', youtubeContent.description.substring(0, 100) + '...');
    
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGenerate();
