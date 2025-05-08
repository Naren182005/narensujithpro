const http = require('http');

// Create a very simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Minimal Server Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; }
        .success { color: green; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Minimal HTTP Server</h1>
      <p class="success">✅ Connection successful!</p>
      <p>This is a minimal HTTP server running on port 3456.</p>
      <p>Current time: ${new Date().toLocaleString()}</p>
      <p>Request URL: ${req.url}</p>
      <hr>
      <p>If you can see this page, your basic HTTP connectivity is working.</p>
    </body>
    </html>
  `);
});

// Use a completely different port
const PORT = 3456;

// Listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== MINIMAL SERVER STARTED ===`);
  console.log(`Server running at:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://127.0.0.1:${PORT}`);
  console.log(`==============================\n`);
});
