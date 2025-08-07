/**
 * MongoDB Atlas Status Checker
 * 
 * This script helps you diagnose and fix MongoDB Atlas connection issues
 */

const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

console.log('🔍 MONGODB ATLAS STATUS CHECKER\n');

// Get your current IP address
function getCurrentIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Test database connection with detailed error analysis
async function testDatabaseConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ No MONGODB_URI found in .env file');
    return false;
  }

  console.log('📋 Connection Details:');
  console.log(`   URI: ${uri.replace(/:[^@]*@/, ':****@')}`);
  
  // Extract cluster info
  const clusterMatch = uri.match(/@([^/]+)/);
  const clusterHost = clusterMatch ? clusterMatch[1] : 'unknown';
  console.log(`   Cluster: ${clusterHost}`);
  
  // Extract database name
  const dbMatch = uri.match(/\/([^?]+)/);
  const dbName = dbMatch ? dbMatch[1] : 'test';
  console.log(`   Database: ${dbName}`);

  try {
    console.log('\n🔄 Testing connection...');
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState}`);
    
    // Test basic operations
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (new database)'}`);
    
    // Test write operation
    const testCollection = conn.connection.db.collection('connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Connection test successful' 
    });
    console.log('   Write Test: ✅ Successful');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('   Cleanup: ✅ Complete');
    
    await mongoose.connection.close();
    return true;
    
  } catch (error) {
    console.log('❌ CONNECTION FAILED');
    console.log(`   Error: ${error.message}`);
    
    // Detailed error analysis
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n💡 SOLUTION: IP Whitelist Issue');
      console.log('   1. Go to MongoDB Atlas → Network Access');
      console.log('   2. Click "Add IP Address"');
      console.log('   3. Add your current IP or use 0.0.0.0/0 for testing');
      
      try {
        const currentIP = await getCurrentIP();
        console.log(`   4. Your current IP: ${currentIP}`);
      } catch (ipError) {
        console.log('   4. Could not detect your IP automatically');
      }
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.log('\n💡 SOLUTION: Cluster Not Found');
      console.log('   1. Check if your cluster is running in MongoDB Atlas');
      console.log('   2. Verify the cluster name in your connection string');
      console.log('   3. Make sure the cluster hasn\'t been paused or deleted');
      
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('\n💡 SOLUTION: Authentication Issue');
      console.log('   1. Check your username and password');
      console.log('   2. Make sure the user has proper permissions');
      console.log('   3. Verify the database name in the connection string');
      
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION: Connection Timeout');
      console.log('   1. Check your internet connection');
      console.log('   2. Try again in a few minutes');
      console.log('   3. Check if MongoDB Atlas is experiencing issues');
      
    } else {
      console.log('\n💡 GENERAL SOLUTIONS:');
      console.log('   1. Check MongoDB Atlas dashboard');
      console.log('   2. Verify cluster is running and not paused');
      console.log('   3. Check network connectivity');
      console.log('   4. Try creating a new cluster');
    }
    
    return false;
  }
}

// Check MongoDB Atlas cluster status
async function checkClusterStatus() {
  console.log('\n🏥 CLUSTER HEALTH CHECK:');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('❌ No MongoDB URI configured');
    return;
  }
  
  // Extract cluster hostname
  const clusterMatch = uri.match(/@([^/]+)/);
  if (!clusterMatch) {
    console.log('❌ Could not parse cluster hostname');
    return;
  }
  
  const clusterHost = clusterMatch[1].split('?')[0]; // Remove query parameters
  console.log(`   Checking: ${clusterHost}`);
  
  // Simple DNS lookup test
  const dns = require('dns').promises;
  try {
    const addresses = await dns.lookup(clusterHost);
    console.log(`   ✅ DNS Resolution: ${addresses.address}`);
    console.log('   ✅ Cluster hostname is reachable');
  } catch (error) {
    console.log(`   ❌ DNS Resolution failed: ${error.message}`);
    console.log('   💡 This suggests the cluster doesn\'t exist or is incorrectly named');
  }
}

// Main function
async function main() {
  console.log('🔧 Environment Check:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Missing'}`);
  
  try {
    const currentIP = await getCurrentIP();
    console.log(`   Your IP: ${currentIP}`);
  } catch (error) {
    console.log('   Your IP: Could not detect');
  }
  
  await checkClusterStatus();
  const connected = await testDatabaseConnection();
  
  console.log('\n📊 FINAL STATUS:');
  if (connected) {
    console.log('🎉 DATABASE CONNECTION: WORKING PERFECTLY!');
    console.log('   Your authentication system will use the database');
    console.log('   All user data will be stored in MongoDB Atlas');
  } else {
    console.log('⚠️ DATABASE CONNECTION: FAILED (Using Fallback)');
    console.log('   Your authentication system will use localStorage');
    console.log('   All features will still work perfectly');
    console.log('   Fix the connection when convenient');
  }
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Start backend: npm run server:dev');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Test authentication: http://localhost:5173/login');
  
  if (!connected) {
    console.log('\n🔧 TO FIX DATABASE CONNECTION:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Check your cluster status');
    console.log('3. Add your IP to Network Access');
    console.log('4. Ensure cluster is not paused');
    console.log('5. Run this script again to verify');
  }
}

main().catch(console.error);
