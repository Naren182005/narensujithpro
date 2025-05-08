const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mock user data
const defaultUser = {
  id: '123456',
  name: 'Naren',
  email: 'naren1872005@gmail.com'
};

// Direct login endpoint
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
