const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Database connection test
const testDatabaseConnection = async () => {
  try {
    console.log('🔗 Testing database connection...');
    const connectDB = require('./server/db/mongoose');
    await connectDB();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Server will continue without database');
    return false;
  }
};

// Initialize database connection
let dbConnected = false;
testDatabaseConnection().then(connected => {
  dbConnected = connected;
});

// Basic route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const connectDB = require('./server/db/mongoose');
    await connectDB();
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mock user data
const defaultUser = {
  id: '123456',
  name: 'Naren',
  email: 'naren1872005@gmail.com'
};

// Google OAuth Authentication endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('🔐 Google OAuth request received');
    const { user, credential } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    console.log('👤 User info:', {
      email: user.email,
      name: user.name,
      picture: user.picture ? 'provided' : 'not provided'
    });

    // Generate a token
    const token = `google_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Try to save user to database if connected
    if (dbConnected) {
      try {
        const User = require('./server/models/User');

        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Update existing user
          existingUser.name = user.name;
          existingUser.picture = user.picture;
          existingUser.lastLogin = new Date();
          await existingUser.save();
          console.log('✅ Updated existing user in database');
        } else {
          // Create new user
          const newUser = new User({
            googleId: user.sub,
            email: user.email,
            name: user.name,
            picture: user.picture,
            lastLogin: new Date()
          });
          await newUser.save();
          console.log('✅ Created new user in database');
        }
      } catch (dbError) {
        console.warn('⚠️ Database save failed, continuing without persistence:', dbError.message);
      }
    }

    // Return success response
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
      message: 'Google authentication successful!'
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Direct login endpoint (fallback)
app.post('/api/users/direct-login', (req, res) => {
  console.log('Direct login request received:', req.body);

  // Generate a simple token
  const token = 'demo-token-' + Date.now();

  // Return user data and token
  res.json({
    user: defaultUser,
    token: token
  });
});

// Content generation API
app.post('/api/generate', (req, res) => {
  const { platform } = req.body;
  console.log(`Generating content for ${platform}`);

  // Sample content for different platforms
  const content = {
    linkedin: "Excited to share our latest innovation that's transforming how teams collaborate. Our new platform increases productivity by 35% while reducing meeting time. #Innovation #Productivity #WorkSmarter",
    instagram: "✨ New day, new possibilities! Check out what we've been working on behind the scenes. This game-changing solution is about to make your workflow so much smoother! Double tap if you're ready for the future of work. 🚀 #WorkLifeBalance #Innovation",
    twitter: "Just launched our game-changing productivity tool! 35% boost in team efficiency with 50% fewer meetings. Try the free demo today: [link] #ProductivityHack",
    facebook: "We're thrilled to announce the launch of our new productivity platform! After months of development and testing, we're proud to share this innovative solution that's already helping teams reduce meeting time by 50% while boosting overall productivity. Learn more and start your free trial at the link below!",
    youtube: "How to Boost Your Team's Productivity by 35% | Our New Platform Explained"
  };

  // Simulate processing delay
  setTimeout(() => {
    res.json({
      content: content[platform] || "Sample content for your social media post. Customize this with your message."
    });
  }, 500);
});

// Post content API (simulated)
app.post('/api/post', (req, res) => {
  const { platform, content } = req.body;

  console.log(`Posting to ${platform}:`, content);

  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: `Content successfully posted to ${platform}`,
      postId: `post-${Date.now()}`
    });
  }, 500);
});

// Authentication status
app.get('/api/auth/status', (req, res) => {
  const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
  const status = {};

  platforms.forEach(platform => {
    status[platform] = {
      authenticated: true,
      profile: {
        name: `Naren (${platform})`,
        username: `naren_${platform}`,
        profileUrl: `https://${platform}.com/naren`,
        profileImage: `https://ui-avatars.com/api/?name=Naren&background=random`
      }
    };
  });

  res.json({
    allAuthenticated: true,
    platforms: status
  });
});

// Simulate authentication
app.post('/api/auth/simulate', (req, res) => {
  const { platform } = req.body;

  console.log(`Simulating auth for ${platform}`);

  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      platform,
      token: `${platform}_token_${Date.now()}`,
      profile: {
        name: `Naren (${platform})`,
        username: `naren_${platform}`,
        profileUrl: `https://${platform}.com/naren`,
        profileImage: `https://ui-avatars.com/api/?name=Naren&background=random`
      }
    });
  }, 500);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================================');
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`PROFILE SET TO: Naren (${defaultUser.email})`);
  console.log('=================================================');

  // Log all routes for debugging
  console.log('Available routes:');
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(`${Object.keys(r.route.methods)[0].toUpperCase()}\t${r.route.path}`);
    }
  });
});
