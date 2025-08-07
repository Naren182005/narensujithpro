// Load environment variables
require('dotenv').config();

// MongoDB Atlas configuration
module.exports = {
  // Use MongoDB URI from environment variables
  mongoURI: process.env.MONGODB_URI || 'mongodb+srv://narenkg2023aiml:Naren%402005@socialsync.rg2okua.mongodb.net/socialmuse',

  // JWT secret for authentication
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',

  // Server port
  port: process.env.PORT || 3001
};
