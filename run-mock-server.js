const { spawn } = require('child_process');
const path = require('path');

console.log('Starting mock server with nodemon...');

// Get the path to nodemon executable
const isWindows = process.platform === 'win32';
const nodemonBin = isWindows ? 'nodemon.cmd' : 'nodemon';
const nodemonPath = path.join(process.env.APPDATA || '', 'npm', 'nodemon.cmd');

// Spawn nodemon process
const nodemon = spawn(nodemonPath, ['--verbose', 'mock-server.js'], {
  stdio: 'inherit',
  shell: true
});

nodemon.on('error', (err) => {
  console.error('Failed to start nodemon:', err);
});

process.on('SIGINT', () => {
  console.log('Stopping nodemon...');
  nodemon.kill();
  process.exit();
});
