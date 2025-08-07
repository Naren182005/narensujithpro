/**
 * Test script to verify Google Authentication setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Google Authentication Setup...\n');

// Test 1: Check if required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'src/lib/google-auth.ts',
  'src/contexts/AuthContext.tsx',
  'server/routes/auth.js',
  '.env'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Test 2: Check environment variables
console.log('\n2. Checking environment variables...');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('VITE_GOOGLE_CLIENT_ID')) {
    console.log('   ✅ VITE_GOOGLE_CLIENT_ID found in .env');
  } else {
    console.log('   ❌ VITE_GOOGLE_CLIENT_ID missing from .env');
  }
  
  if (envContent.includes('JWT_SECRET')) {
    console.log('   ✅ JWT_SECRET found in .env');
  } else {
    console.log('   ❌ JWT_SECRET missing from .env');
  }
} catch (error) {
  console.log('   ❌ Error reading .env file:', error.message);
}

// Test 3: Check package.json dependencies
console.log('\n3. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@react-oauth/google',
    'jsonwebtoken',
    'bcryptjs',
    'mongoose'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`   ✅ ${dep} installed (${dependencies[dep]})`);
    } else {
      console.log(`   ❌ ${dep} missing`);
    }
  });
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Test 4: Check config file
console.log('\n4. Checking configuration...');
try {
  const configContent = fs.readFileSync('src/config.ts', 'utf8');
  
  if (configContent.includes('googleClientId')) {
    console.log('   ✅ googleClientId configured');
  } else {
    console.log('   ❌ googleClientId missing from config');
  }
  
  if (configContent.includes('import.meta.env.VITE_GOOGLE_CLIENT_ID')) {
    console.log('   ✅ Environment variable integration configured');
  } else {
    console.log('   ❌ Environment variable integration missing');
  }
} catch (error) {
  console.log('   ❌ Error reading config file:', error.message);
}

// Test 5: Check main.tsx for GoogleOAuthProvider
console.log('\n5. Checking main.tsx setup...');
try {
  const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
  
  if (mainContent.includes('GoogleOAuthProvider')) {
    console.log('   ✅ GoogleOAuthProvider configured in main.tsx');
  } else {
    console.log('   ❌ GoogleOAuthProvider missing from main.tsx');
  }
  
  if (mainContent.includes('config.googleClientId')) {
    console.log('   ✅ Google Client ID passed to provider');
  } else {
    console.log('   ❌ Google Client ID not passed to provider');
  }
} catch (error) {
  console.log('   ❌ Error reading main.tsx:', error.message);
}

// Test 6: Check Login.tsx for Google login button
console.log('\n6. Checking Login component...');
try {
  const loginContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');
  
  if (loginContent.includes('GoogleLogin')) {
    console.log('   ✅ GoogleLogin component used');
  } else {
    console.log('   ❌ GoogleLogin component missing');
  }
  
  if (loginContent.includes('handleGoogleSuccess')) {
    console.log('   ✅ Google success handler implemented');
  } else {
    console.log('   ❌ Google success handler missing');
  }
} catch (error) {
  console.log('   ❌ Error reading Login.tsx:', error.message);
}

// Summary
console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
} else {
  console.log('❌ Some required files are missing');
}

console.log('\n🚀 Next Steps:');
console.log('1. Set up Google Cloud Console (see GOOGLE_AUTH_SETUP.md)');
console.log('2. Update VITE_GOOGLE_CLIENT_ID in .env file');
console.log('3. Start the backend server: npm run server:dev');
console.log('4. Start the frontend server: npm run dev');
console.log('5. Test Google login at http://localhost:5173/login');

console.log('\n📚 Documentation:');
console.log('- Complete setup guide: GOOGLE_AUTH_SETUP.md');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- React OAuth Google docs: https://github.com/MomenSherif/react-oauth');
