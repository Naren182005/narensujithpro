const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    // Use the MongoDB URI from the config file
    const mongoURI = config.mongoURI;

    console.log('Connecting to MongoDB Atlas...');

    // Connect to MongoDB Atlas with simplified options
    // Note: useNewUrlParser and useUnifiedTopology are deprecated in newer versions
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);

    // More detailed error logging
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server');
      console.error('Please check your network connection and MongoDB Atlas status');
    } else if (error.message.includes('bad auth')) {
      console.error('Authentication failed');
      console.error('Please check your username and password in the connection string');
    }

    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
