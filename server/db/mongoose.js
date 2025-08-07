const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    // Use the MongoDB URI from the config file
    const mongoURI = config.mongoURI;

    console.log('Attempting to connect to database...');
    console.log(`URI: ${mongoURI.replace(/:[^@]*@/, ':****@')}`); // Hide password

    // Try to connect with a shorter timeout for faster feedback
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log(`✅ Database Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);

    // More detailed error logging
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Could not connect to any MongoDB server');
      console.error('   - Check your network connection');
      console.error('   - Verify MongoDB Atlas cluster exists');
      console.error('   - Ensure IP is whitelisted');
    } else if (error.message.includes('bad auth')) {
      console.error('💡 Authentication failed');
      console.error('   - Check your username and password in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Cluster hostname not found');
      console.error('   - Verify the cluster exists in MongoDB Atlas');
      console.error('   - Check the connection string is correct');
    }

    console.error('\n🔧 Quick fixes:');
    console.error('1. Create a new MongoDB Atlas cluster');
    console.error('2. Update MONGODB_URI in .env file');
    console.error('3. Or install MongoDB locally for development');

    // Don't exit the process, let the app handle the error gracefully
    throw error;
  }
};

module.exports = connectDB;
