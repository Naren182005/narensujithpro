#!/usr/bin/env node

/**
 * Frontend Development Server Startup Script
 * 
 * This script starts the Vite development server with proper configuration.
 */

const { spawn } = require('child_process');

console.log('🎨 Starting Frontend Development Server...');
console.log('==========================================');

// Start the frontend development server
const frontendProcess = spawn('npx', ['vite', '--host', 'localhost', '--port', '5173', '--open'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

frontendProcess.on('error', (error) => {
  console.error('❌ Failed to start frontend server:', error.message);
  process.exit(1);
});

frontendProcess.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down frontend server...');
  frontendProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down frontend server...');
  frontendProcess.kill('SIGTERM');
});
