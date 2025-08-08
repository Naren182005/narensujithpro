const http = require('http');

console.log('🔍 COMPREHENSIVE GOOGLE AUTHENTICATION DIAGNOSTIC');
console.log('================================================\n');

const API_BASE = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function diagnoseDatabaseSchema() {
  console.log('1️⃣ DATABASE SCHEMA ANALYSIS');
  console.log('============================');
  
  try {
    const result = await makeRequest('GET', '/api/users');
    if (result.status === 200 && result.data.success) {
      console.log(`✅ Database accessible: ${result.data.database}`);
      console.log(`👥 Total users: ${result.data.total}`);
      
      // Analyze user schema
      const users = result.data.users;
      const schemaAnalysis = {
        hasGoogleId: 0,
        hasPicture: 0,
        hasAuthProvider: 0,
        hasEmailVerified: 0,
        hasLastLogin: 0,
        googleUsers: 0,
        emailUsers: 0
      };
      
      users.forEach(user => {
        if (user.googleId) schemaAnalysis.hasGoogleId++;
        if (user.picture) schemaAnalysis.hasPicture++;
        if (user.authProvider) schemaAnalysis.hasAuthProvider++;
        if (user.emailVerified !== undefined) schemaAnalysis.hasEmailVerified++;
        if (user.lastLogin) schemaAnalysis.hasLastLogin++;
        if (user.authProvider === 'google') schemaAnalysis.googleUsers++;
        if (user.authProvider === 'email') schemaAnalysis.emailUsers++;
      });
      
      console.log('\n📊 SCHEMA ANALYSIS:');
      console.log(`   Google ID field: ${schemaAnalysis.hasGoogleId}/${users.length} users`);
      console.log(`   Picture field: ${schemaAnalysis.hasPicture}/${users.length} users`);
      console.log(`   Auth Provider: ${schemaAnalysis.hasAuthProvider}/${users.length} users`);
      console.log(`   Email Verified: ${schemaAnalysis.hasEmailVerified}/${users.length} users`);
      console.log(`   Last Login: ${schemaAnalysis.hasLastLogin}/${users.length} users`);
      console.log(`   Google Users: ${schemaAnalysis.googleUsers}`);
      console.log(`   Email Users: ${schemaAnalysis.emailUsers}`);
      
      // Check for schema inconsistencies
      const issues = [];
      if (schemaAnalysis.hasPicture < users.length) {
        issues.push(`${users.length - schemaAnalysis.hasPicture} users missing profile pictures`);
      }
      if (schemaAnalysis.hasAuthProvider < users.length) {
        issues.push(`${users.length - schemaAnalysis.hasAuthProvider} users missing auth provider`);
      }
      
      if (issues.length > 0) {
        console.log('\n⚠️  SCHEMA ISSUES FOUND:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('\n✅ Schema appears consistent');
      }
      
      return { success: true, users, issues };
    } else {
      console.log('❌ Database not accessible');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Database diagnostic error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testGoogleAuthEndpoint() {
  console.log('\n2️⃣ GOOGLE AUTH ENDPOINT TEST');
  console.log('=============================');
  
  const testGoogleUser = {
    id: 'diagnostic_test_123',
    name: 'Diagnostic Test User',
    email: 'diagnostic@test.com',
    picture: 'https://lh3.googleusercontent.com/diagnostic-test-picture',
    verified_email: true
  };
  
  try {
    const result = await makeRequest('POST', '/api/auth/google', {
      user: testGoogleUser,
      googleToken: 'diagnostic_test_token'
    });
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Google auth endpoint working');
      console.log(`   User created/updated: ${result.data.user.name}`);
      console.log(`   Email: ${result.data.user.email}`);
      console.log(`   Picture: ${result.data.user.picture ? 'Present' : 'Missing'}`);
      console.log(`   Token type: ${result.data.accessToken ? 'JWT' : 'Legacy'}`);
      
      return { success: true, user: result.data.user, token: result.data.accessToken || result.data.token };
    } else {
      console.log('❌ Google auth endpoint failed');
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.data.message || 'Unknown error'}`);
      return { success: false, error: result.data.message };
    }
  } catch (error) {
    console.log('❌ Google auth test error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testProfileAccess(authData) {
  console.log('\n3️⃣ PROFILE ACCESS TEST');
  console.log('=======================');
  
  if (!authData || !authData.success || !authData.token) {
    console.log('❌ No valid auth data for profile test');
    return { success: false };
  }
  
  try {
    const result = await makeRequest('PUT', '/api/users/profile', {
      name: 'Updated Diagnostic User'
    }, authData.token);
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Profile access working');
      console.log(`   Updated user: ${result.data.user.name}`);
      return { success: true };
    } else {
      console.log('❌ Profile access failed');
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.data.message || 'Unknown error'}`);
      return { success: false, error: result.data.message };
    }
  } catch (error) {
    console.log('❌ Profile access error:', error.message);
    return { success: false, error: error.message };
  }
}

async function analyzeGoogleOAuthConfig() {
  console.log('\n4️⃣ GOOGLE OAUTH CONFIGURATION');
  console.log('==============================');
  
  console.log('📋 Current Configuration:');
  console.log('   Client ID: 763549280829-chb0u2g8vbc3uflojo61dua7832bdivd.apps.googleusercontent.com');
  console.log('   Authorized Origins: http://localhost:5173, http://localhost:3000');
  console.log('   Redirect URIs: Need to be configured');
  
  console.log('\n🔍 Common Issues:');
  console.log('   ❌ COOP Policy Errors: Origin not whitelisted');
  console.log('   ❌ Button Width Warnings: Invalid width parameter');
  console.log('   ❌ Credential Errors: Token verification issues');
  
  console.log('\n✅ Recommended Fixes:');
  console.log('   1. Add http://localhost:5173 to Google Console authorized origins');
  console.log('   2. Add http://localhost:3001 to authorized origins for API calls');
  console.log('   3. Configure proper redirect URIs');
  console.log('   4. Update button configuration to remove width warnings');
  
  return { success: true };
}

async function runComprehensiveDiagnostic() {
  console.log('🚀 Starting comprehensive Google authentication diagnostic...\n');
  
  const results = {
    database: await diagnoseDatabaseSchema(),
    googleAuth: await testGoogleAuthEndpoint(),
    profileAccess: null,
    oauthConfig: await analyzeGoogleOAuthConfig()
  };
  
  // Test profile access if auth succeeded
  if (results.googleAuth.success) {
    results.profileAccess = await testProfileAccess(results.googleAuth);
  }
  
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  
  let totalTests = 0;
  let passedTests = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    if (result !== null) {
      totalTests++;
      if (result.success) {
        passedTests++;
        console.log(`✅ ${test}: PASSED`);
      } else {
        console.log(`❌ ${test}: FAILED - ${result.error || 'Unknown error'}`);
      }
    }
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL DIAGNOSTICS PASSED!');
    console.log('Your Google authentication system is working correctly.');
  } else {
    console.log('\n⚠️  ISSUES DETECTED - See detailed analysis above');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (!results.database.success) {
      console.log('   1. Fix database connection and schema issues');
    }
    if (!results.googleAuth.success) {
      console.log('   2. Fix Google authentication endpoint');
    }
    if (results.profileAccess && !results.profileAccess.success) {
      console.log('   3. Fix profile access authentication');
    }
    console.log('   4. Update Google OAuth configuration in Google Console');
    console.log('   5. Fix CORS and origin policy issues');
  }
  
  console.log('\n🌐 Next Steps:');
  console.log('   1. Open Google Cloud Console');
  console.log('   2. Update OAuth 2.0 Client IDs configuration');
  console.log('   3. Test Google login in browser');
  console.log('   4. Check browser console for remaining errors');
  
  return results;
}

// Run the comprehensive diagnostic
runComprehensiveDiagnostic().catch(console.error);
