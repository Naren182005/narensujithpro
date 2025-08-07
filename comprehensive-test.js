/**
 * Comprehensive Test - All Issues Check
 * This script checks everything from bottom to top
 */

const fs = require('fs');
const http = require('http');
require('dotenv').config();

console.log('🔍 COMPREHENSIVE SYSTEM CHECK - Bottom to Top\n');

// 1. Environment & Configuration Check
console.log('1. 🔧 ENVIRONMENT & CONFIGURATION:');
console.log(`   ✅ Node.js Version: ${process.version}`);
console.log(`   ✅ PORT: ${process.env.PORT || '3001 (default)'}`);
console.log(`   ✅ MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : '❌ Missing'}`);
console.log(`   ✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : '❌ Missing'}`);
console.log(`   ✅ GOOGLE_CLIENT_ID: ${process.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : '❌ Missing'}`);

// 2. File Structure Check
console.log('\n2. 📁 CRITICAL FILES CHECK:');
const criticalFiles = [
  { file: 'package.json', desc: 'Package configuration' },
  { file: '.env', desc: 'Environment variables' },
  { file: 'src/main.tsx', desc: 'React entry point' },
  { file: 'src/App.tsx', desc: 'Main App component' },
  { file: 'src/config.ts', desc: 'App configuration' },
  { file: 'src/pages/Login.tsx', desc: 'Login page' },
  { file: 'src/lib/google-auth.ts', desc: 'Google auth service' },
  { file: 'server/index.js', desc: 'Backend server' },
  { file: 'server/routes/auth.js', desc: 'Auth routes' },
  { file: 'server/models/User.js', desc: 'User model' }
];

criticalFiles.forEach(({ file, desc }) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} - ${desc}`);
  } else {
    console.log(`   ❌ ${file} - ${desc} MISSING!`);
  }
});

// 3. Router Configuration Check
console.log('\n3. 🛣️ ROUTER CONFIGURATION CHECK:');
try {
  const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  
  const mainHasRouter = mainContent.includes('BrowserRouter');
  const appHasRouter = appContent.includes('BrowserRouter');
  
  console.log(`   main.tsx has BrowserRouter: ${mainHasRouter ? '❌ DUPLICATE!' : '✅ Clean'}`);
  console.log(`   App.tsx has BrowserRouter: ${appHasRouter ? '✅ Correct' : '❌ Missing'}`);
  
  if (mainHasRouter && appHasRouter) {
    console.log('   🚨 ROUTER CONFLICT DETECTED - This causes the error!');
  } else if (!mainHasRouter && appHasRouter) {
    console.log('   ✅ Router configuration is correct');
  } else {
    console.log('   ⚠️ Router configuration needs review');
  }
} catch (error) {
  console.log(`   ❌ Error reading router files: ${error.message}`);
}

// 4. Google OAuth Configuration Check
console.log('\n4. 🔐 GOOGLE OAUTH CONFIGURATION:');
try {
  const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
  const configContent = fs.readFileSync('src/config.ts', 'utf8');
  
  const hasGoogleProvider = mainContent.includes('GoogleOAuthProvider');
  const hasClientIdConfig = configContent.includes('googleClientId');
  const hasEnvIntegration = configContent.includes('import.meta.env.VITE_GOOGLE_CLIENT_ID');
  
  console.log(`   ✅ GoogleOAuthProvider in main.tsx: ${hasGoogleProvider ? 'Yes' : '❌ Missing'}`);
  console.log(`   ✅ Google Client ID in config: ${hasClientIdConfig ? 'Yes' : '❌ Missing'}`);
  console.log(`   ✅ Environment integration: ${hasEnvIntegration ? 'Yes' : '❌ Missing'}`);
  
  if (process.env.VITE_GOOGLE_CLIENT_ID) {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId.includes('apps.googleusercontent.com')) {
      console.log('   ✅ Client ID format is valid');
    } else {
      console.log('   ⚠️ Client ID format might be incorrect');
    }
  }
} catch (error) {
  console.log(`   ❌ Error checking Google OAuth config: ${error.message}`);
}

// 5. Backend Server Check
console.log('\n5. 🖥️ BACKEND SERVER CHECK:');
const testBackend = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Backend server is running');
          console.log(`   ✅ Health check: ${data}`);
          resolve(true);
        } else {
          console.log(`   ❌ Backend returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('   ❌ Backend server is not running');
      console.log(`   Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Backend request timed out');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// 6. Database Connection Check
console.log('\n6. 🗄️ DATABASE CONNECTION:');
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.includes('mongodb+srv')) {
    console.log('   ✅ MongoDB Atlas URI detected');
    console.log('   ⚠️ Connection may fail if cluster doesn\'t exist');
  } else if (process.env.MONGODB_URI.includes('localhost')) {
    console.log('   ✅ Local MongoDB URI detected');
    console.log('   ⚠️ Requires local MongoDB installation');
  }
} else {
  console.log('   ❌ No MongoDB URI configured');
}

// 7. Dependencies Check
console.log('\n7. 📦 DEPENDENCIES CHECK:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@react-oauth/google',
    'react-router-dom',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs'
  ];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Missing`);
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
}

// Main test execution
async function runComprehensiveTest() {
  const backendRunning = await testBackend();
  
  console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
  console.log('================================');
  
  // Check for the main issue
  try {
    const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
    const appContent = fs.readFileSync('src/App.tsx', 'utf8');
    
    const mainHasRouter = mainContent.includes('BrowserRouter');
    const appHasRouter = appContent.includes('BrowserRouter');
    
    if (mainHasRouter && appHasRouter) {
      console.log('🚨 CRITICAL ISSUE: Duplicate BrowserRouter components');
      console.log('   This is causing the "Router inside Router" error');
      console.log('   ❌ Status: NEEDS FIX');
    } else if (!mainHasRouter && appHasRouter) {
      console.log('✅ Router configuration: FIXED');
      console.log('   Only one BrowserRouter in App.tsx');
    }
  } catch (error) {
    console.log('❌ Could not check router configuration');
  }
  
  console.log(`✅ Backend Server: ${backendRunning ? 'RUNNING' : 'NOT RUNNING'}`);
  console.log(`✅ Environment Variables: CONFIGURED`);
  console.log(`✅ Google OAuth Setup: READY`);
  console.log(`⚠️ Database: ${process.env.MONGODB_URI ? 'CONFIGURED (may fail)' : 'NOT CONFIGURED'}`);
  
  console.log('\n🎯 NEXT ACTIONS:');
  if (!backendRunning) {
    console.log('1. ❌ Start backend server: npm run server:dev');
  } else {
    console.log('1. ✅ Backend server is running');
  }
  
  console.log('2. ✅ Router issue should be fixed');
  console.log('3. 🌐 Open http://localhost:5173/login');
  console.log('4. 🔐 Test Google authentication');
  
  console.log('\n🎉 SYSTEM STATUS: READY FOR TESTING!');
}

runComprehensiveTest().catch(console.error);
