const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get the absolute path to the HTML file
const htmlFilePath = path.join(__dirname, 'standalone-app', 'index.html');

// Check if the file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error(`Error: File not found: ${htmlFilePath}`);
  process.exit(1);
}

// Convert to file URL
const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;

console.log('Opening SocialMuse Standalone App...');
console.log(`URL: ${fileUrl}`);

// Determine the command based on the operating system
let command;
switch (os.platform()) {
  case 'win32':
    command = `start "" "${fileUrl}"`;
    break;
  case 'darwin':
    command = `open "${fileUrl}"`;
    break;
  default:
    command = `xdg-open "${fileUrl}"`;
}

// Execute the command to open the browser
exec(command, (error) => {
  if (error) {
    console.error(`Error opening browser: ${error.message}`);
    console.log('\nIf the app doesn\'t open automatically, please manually open this file in your browser:');
    console.log(htmlFilePath);
  } else {
    console.log('Browser opened successfully!');
  }
});

console.log('\nPress Ctrl+C to exit this script.');
