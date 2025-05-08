// Test script for the summarization endpoint
require('dotenv').config();
const axios = require('axios');

async function testSummarizeEndpoint() {
  try {
    console.log('Testing /api/summarize endpoint...');
    
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
    
    // Make request to the summarize endpoint
    console.log('Sending request to /api/summarize endpoint...');
    const response = await axios.post(
      'http://localhost:3001/api/summarize',
      {
        text,
        maxLength: 100,
        minLength: 50
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the summary from the response
    const { summary, original_length, summary_length, reduction_percentage } = response.data;
    
    console.log('\nGenerated Summary:');
    console.log('=================');
    console.log(summary);
    console.log('=================');
    
    console.log('\nSummary Statistics:');
    console.log('Original length:', original_length, 'characters');
    console.log('Summary length:', summary_length, 'characters');
    console.log('Reduction percentage:', reduction_percentage + '%');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error testing summarize endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
console.log('Starting summarize endpoint test...');
testSummarizeEndpoint();
