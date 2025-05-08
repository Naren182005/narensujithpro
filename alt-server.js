const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
// Using a high port number that's less likely to be in use
const PORT = 50000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Create a simple HTML file on the fly
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Server Connection Test</h1>
    <p class="success">✅ Connection successful!</p>
    
    <div class="container">
        <h2>Server Information</h2>
        <p>This simple server is running on port ${PORT}.</p>
        <p>Current time: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="container">
        <h2>Next Steps</h2>
        <p>Now that we've confirmed the server is accessible, we can:</p>
        <ul>
            <li>Troubleshoot the main application server</li>
            <li>Check for port conflicts</li>
            <li>Verify network settings</li>
        </ul>
    </div>
    
    <script>
        console.log('Page loaded successfully');
        document.addEventListener('DOMContentLoaded', () => {
            // Add the current timestamp to show the page is dynamic
            const timeElement = document.createElement('p');
            timeElement.textContent = 'Page loaded at: ' + new Date().toLocaleTimeString();
            document.body.appendChild(timeElement);
        });
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'test-page.html'), htmlContent);

// Serve the test page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-page.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Start the server on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== SERVER STARTED SUCCESSFULLY ===`);
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`\nTry accessing at:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://127.0.0.1:${PORT}`);
  console.log(`\nIf you're still seeing connection issues, try:`);
  console.log(`1. Checking if your firewall is blocking the connection`);
  console.log(`2. Verifying no other application is using port ${PORT}`);
  console.log(`3. Trying a different browser`);
  console.log(`===================================\n`);
});
