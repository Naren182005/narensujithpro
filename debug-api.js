// Debug script to test the API directly
const http = require('http');

// Data to send in the request
const data = JSON.stringify({
  platform: 'linkedin'
});

// Options for the HTTP request
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Request body:', data);

// Make the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log(`RESPONSE BODY: ${responseData}`);
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Parsed response:', parsedData);
      if (parsedData.content) {
        console.log('Content preview:', typeof parsedData.content === 'string' 
          ? parsedData.content.substring(0, 100) + '...' 
          : JSON.stringify(parsedData.content).substring(0, 100) + '...');
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e);
    }
  });
});

// Handle errors
req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error(e.stack);
});

// Write data to request body
req.write(data);

// End the request
req.end();

console.log('Request sent, waiting for response...');
