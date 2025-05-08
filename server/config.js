// MongoDB Atlas configuration
module.exports = {
  // Direct MongoDB URI with the new connection string
  mongoURI: 'mongodb+srv://narenkg2023aiml:Naren20052008@narensocialsync.j4rq2fe.mongodb.net/socialmuse?retryWrites=true&w=majority',

  // JWT secret for authentication
  jwtSecret: 'your-secret-key-change-this-in-production',

  // Server port
  port: process.env.PORT || 3000
};
