import http.server
import socketserver
from datetime import datetime

# Define the HTML content
HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Python HTTP Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; }
        .success { color: green; font-weight: bold; }
        .container { border: 1px solid #ddd; padding: 20px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Python HTTP Server</h1>
    <p class="success">✅ Connection successful!</p>
    
    <div class="container">
        <h2>Server Information</h2>
        <p>This is a simple Python HTTP server running on port 8000.</p>
        <p>Current time: {time}</p>
    </div>
    
    <div class="container">
        <h2>Next Steps</h2>
        <p>Since this server is working, the issue might be specific to Node.js or your application configuration.</p>
    </div>
</body>
</html>
"""

# Create a custom request handler
class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Insert the current time into the HTML
        content = HTML.format(time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        
        self.wfile.write(content.encode())

# Set up the server
PORT = 8000
Handler = MyHandler

# Allow connections from any IP
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Python server running at http://localhost:{PORT}")
    print(f"Press Ctrl+C to stop the server")
    httpd.serve_forever()
