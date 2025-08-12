const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting simple backend server...');
console.log('PORT:', PORT);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Simple backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Import database connection here to avoid startup issues
    const connectDB = require('./server/db/mongoose');
    await connectDB();
    res.json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Simple auth endpoint for testing
app.post('/api/auth/google', (req, res) => {
  const { user } = req.body;

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User information is required'
    });
  }

  // Generate a simple token
  const token = `simple_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  res.json({
    success: true,
    token,
    user: {
      id: user.sub || Date.now().toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: 'user'
    },
    message: 'Authentication successful!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
});

module.exports = app;
