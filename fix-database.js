/**
 * Database Fix Script
 * This script helps diagnose and fix database connection issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔧 Database Connection Diagnostic Tool\n');

// Test different connection strings
const connectionStrings = [
  {
    name: 'Environment Variable',
    uri: process.env.MONGODB_URI
  },
  {
    name: 'Fallback URI',
    uri: 'mongodb+srv://narenkg2023aiml:Naren%402005@socialsync.rg2okua.mongodb.net/socialmuse'
  },
  {
    name: 'Alternative URI (if you have another cluster)',
    uri: 'mongodb+srv://narenkg2023aiml:Naren20052008@narensocialsync.j4rq2fe.mongodb.net/socialmuse'
  }
];

async function testConnection(name, uri) {
  if (!uri) {
    console.log(`❌ ${name}: No URI provided`);
    return false;
  }

  try {
    console.log(`🔍 Testing ${name}...`);
    console.log(`   URI: ${uri.replace(/:[^@]*@/, ':****@')}`); // Hide password
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log(`✅ ${name}: Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    // Test basic operations
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None'}`);
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Failed`);
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('   💡 This suggests the cluster hostname is incorrect or doesn\'t exist');
    } else if (error.message.includes('bad auth')) {
      console.log('   💡 This suggests incorrect username/password');
    } else if (error.message.includes('IP')) {
      console.log('   💡 This suggests IP whitelist issues in MongoDB Atlas');
    }
    
    return false;
  }
}

async function runDiagnostics() {
  console.log('Environment Variables:');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
  console.log(`   PORT: ${process.env.PORT || 'Not set (will default to 3001)'}\n`);

  let successfulConnection = false;
  
  for (const { name, uri } of connectionStrings) {
    const success = await testConnection(name, uri);
    if (success) {
      successfulConnection = true;
      break;
    }
    console.log(''); // Empty line for readability
  }

  console.log('\n📋 Diagnosis Summary:');
  if (successfulConnection) {
    console.log('✅ Database connection successful!');
    console.log('   Your server should now start without database errors.');
  } else {
    console.log('❌ All database connections failed.');
    console.log('\n🔧 Recommended fixes:');
    console.log('1. Check your MongoDB Atlas cluster status');
    console.log('2. Verify your username and password');
    console.log('3. Ensure your IP is whitelisted (or use 0.0.0.0/0 for testing)');
    console.log('4. Create a new cluster if the current one doesn\'t exist');
    console.log('5. Update the connection string in your .env file');
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Fix the database connection using the recommendations above');
  console.log('2. Run: npm run server:dev');
  console.log('3. In another terminal, run: npm run dev');
  console.log('4. Test Google login at: http://localhost:5173/login');
}

// Run the diagnostics
runDiagnostics().catch(console.error);
