#!/usr/bin/env node

/**
 * Backend Server Startup Script
 * 
 * This script starts the backend server with proper database connection
 * and error handling.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Server...');
console.log('============================');

// Start the backend server
const serverProcess = spawn('node', ['basic-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  serverProcess.kill('SIGTERM');
});
