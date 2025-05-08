const http = require('http');

// Data to send in the request
const data = JSON.stringify({
  platform: 'linkedin'
});

// Options for the HTTP request
const options = {
  hostname: 'localhost',
  port: 3001, // Updated port to match the server port in .env
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

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
    console.log(`BODY: ${responseData}`);
  });
});

// Handle errors
req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);

// End the request
req.end();

console.log('Test request sent to generate content...');
