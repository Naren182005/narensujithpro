// Test MongoDB Atlas connection
const mongoose = require('mongoose');
const config = require('./config');

async function testConnection(uri, description) {
  try {
    console.log(`Testing MongoDB Atlas connection with ${description}...`);
    console.log(`Connection string: ${uri}`);

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);

    // Test the connection by listing collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'None'}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');

    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas with ${description}: ${error.message}`);

    // More detailed error logging
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server');
      console.error('Please check your network connection and MongoDB Atlas status');
    } else if (error.name === 'MongoError' || error.message.includes('bad auth')) {
      console.error('Authentication failed');
      console.error('Please check your username and password in the connection string');
    }

    console.error('Full error:', error);
    return false;
  }
}

// Try with the new connection string
async function tryConnections() {
  // Try the connection string
  const result = await testConnection(config.mongoURI, 'new connection string');

  if (result) {
    console.log('Successfully connected with the new connection string');
    return true;
  }

  console.log('Connection failed');
  return false;
}

// Run the tests
tryConnections()
  .then(success => {
    console.log(`Connection tests ${success ? 'succeeded' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
