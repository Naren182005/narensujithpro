/**
 * Debug Google Authentication Issues
 * This script helps identify common Google OAuth problems
 */

const fs = require('fs');
const https = require('https');

console.log('🔍 Debugging Google Authentication Issues...\n');

// Read environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const googleClientId = envContent.match(/VITE_GOOGLE_CLIENT_ID=(.+)/)?.[1];

console.log('1. Environment Configuration:');
console.log(`   Google Client ID: ${googleClientId ? googleClientId.substring(0, 20) + '...' : 'NOT FOUND'}`);

if (!googleClientId) {
  console.log('   ❌ VITE_GOOGLE_CLIENT_ID not found in .env file');
  process.exit(1);
}

// Check if the client ID format is correct
console.log('\n2. Client ID Validation:');
if (googleClientId.includes('.apps.googleusercontent.com')) {
  console.log('   ✅ Client ID format appears correct');
} else {
  console.log('   ❌ Client ID format appears incorrect');
  console.log('   Expected format: xxxxx-xxxxx.apps.googleusercontent.com');
}

// Test Google OAuth endpoint
console.log('\n3. Testing Google OAuth Endpoint:');
const testUrl = `https://oauth2.googleapis.com/tokeninfo?client_id=${googleClientId}`;

https.get(testUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ Google Client ID is valid');
      const response = JSON.parse(data);
      console.log(`   App Name: ${response.aud || 'Unknown'}`);
    } else if (res.statusCode === 400) {
      console.log('   ❌ Google Client ID is invalid or not properly configured');
      console.log('   This usually means:');
      console.log('     - The Client ID doesn\'t exist');
      console.log('     - The Client ID is not properly formatted');
      console.log('     - The OAuth consent screen is not configured');
    } else {
      console.log(`   ⚠️  Unexpected response: ${res.statusCode}`);
    }
  });
}).on('error', (err) => {
  console.log('   ❌ Network error:', err.message);
});

// Check frontend configuration
console.log('\n4. Frontend Configuration:');
try {
  const configContent = fs.readFileSync('src/config.ts', 'utf8');
  if (configContent.includes('import.meta.env.VITE_GOOGLE_CLIENT_ID')) {
    console.log('   ✅ Environment variable properly referenced in config');
  } else {
    console.log('   ❌ Environment variable not properly referenced');
  }
  
  // Check if there's a fallback client ID
  const fallbackMatch = configContent.match(/googleClientId:.*?'([^']+)'/);
  if (fallbackMatch && fallbackMatch[1] !== googleClientId) {
    console.log(`   ⚠️  Fallback Client ID found: ${fallbackMatch[1].substring(0, 20)}...`);
    console.log('   This might be used if environment variable is not set');
  }
} catch (error) {
  console.log('   ❌ Error reading config file:', error.message);
}

// Common issues and solutions
console.log('\n5. Common Issues and Solutions:');
console.log('   If Google login fails, check:');
console.log('   • Authorized JavaScript origins in Google Cloud Console');
console.log('     Should include: http://localhost:5173');
console.log('   • OAuth consent screen is properly configured');
console.log('   • The app is not in "Testing" mode with restricted users');
console.log('   • Browser is not blocking third-party cookies');
console.log('   • No ad blockers interfering with Google scripts');

console.log('\n6. Next Steps:');
console.log('   1. Go to Google Cloud Console');
console.log('   2. Navigate to APIs & Services > Credentials');
console.log('   3. Find your OAuth 2.0 Client ID');
console.log('   4. Add http://localhost:5173 to Authorized JavaScript origins');
console.log('   5. Save and wait a few minutes for changes to propagate');
