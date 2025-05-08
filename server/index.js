const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');

// Import database connection
const connectDB = require('./db/mongoose');

// Import routes
const userRoutes = require('./routes/users');
const socialAccountRoutes = require('./routes/social-accounts');

const app = express();
const PORT = config.port;

// Create a default user if it doesn't exist
const createDefaultUser = async () => {
  try {
    const User = require('./models/User');

    console.log('Checking for default user...');

    // Check if the default user already exists
    const existingUser = await User.findOne({ email: 'naren1872005@gmail.com' });

    if (!existingUser) {
      console.log('Default user not found, creating...');

      // Create a new user
      const user = new User({
        name: 'Naren',
        email: 'naren1872005@gmail.com',
        password: 'password123' // This will be hashed by the pre-save hook
      });

      await user.save();
      console.log('Default user created successfully: naren1872005@gmail.com');
    } else {
      console.log('Default user already exists:', existingUser.email);
    }

    // List all users for debugging
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.email}`);
    });

  } catch (error) {
    console.error('Error creating default user:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
};

// Connect to MongoDB first, then create the default user
connectDB().then(async (conn) => {
  console.log('MongoDB connection successful');

  // Log database information
  console.log(`Connected to database: ${conn.connection.name}`);
  console.log(`MongoDB server: ${conn.connection.host}:${conn.connection.port}`);

  try {
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', ') || 'None');
  } catch (err) {
    console.error('Error listing collections:', err.message);
  }

  // Call the function to create the default user after successful connection
  await createDefaultUser();

  console.log('Server initialization complete');
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.error('Error details:', err.message);
  if (err.stack) {
    console.error('Stack trace:', err.stack);
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/social-accounts', socialAccountRoutes);

// Content generation API
app.post('/api/generate', (req, res) => {
  const { platform } = req.body;

  // Simulated content generation - in a real app, this would call an AI service
  const platformSpecificContent = {
    linkedin: "Excited to share our latest innovation that's transforming how teams collaborate. Our new platform increases productivity by 35% while reducing meeting time. #Innovation #Productivity #WorkSmarter",
    instagram: "✨ New day, new possibilities! Check out what we've been working on behind the scenes. This game-changing solution is about to make your workflow so much smoother! Double tap if you're ready for the future of work. 🚀 #WorkLifeBalance #Innovation",
    twitter: "Just launched our game-changing productivity tool! 35% boost in team efficiency with 50% fewer meetings. Try the free demo today: [link] #ProductivityHack",
    facebook: "We're thrilled to announce the launch of our new productivity platform! After months of development and testing with our amazing beta users, we're ready to share it with the world. This tool has been shown to increase team productivity by 35% while reducing meeting time by half. Click the link to learn more and start your free trial!",
    youtube: {
      title: "Revolutionary Productivity Tool | How We Increased Efficiency by 35%",
      description: "In this video, we walk through our new productivity platform that's changing how teams work together. We'll show you the key features that help reduce meeting time and boost overall efficiency, plus share some success stories from our beta testers.\n\nTimestamps:\n0:00 Introduction\n1:23 The Problem with Modern Workflows\n3:45 Our Solution\n5:30 Key Features\n8:15 Case Study: How Team X Saved 10 Hours Per Week\n10:30 Pricing and How to Get Started",
      tags: "productivity,efficiency,remote work,collaboration,meetings,time management,work tools,productivity app"
    },
    common: "Introducing our new productivity platform that helps teams collaborate more efficiently. With our tool, you can expect a 35% increase in productivity and 50% reduction in meeting time. Try it today!"
  };

  // Simulate processing delay
  setTimeout(() => {
    if (platform === 'youtube') {
      res.json({ content: platformSpecificContent.youtube });
    } else if (platform === 'common') {
      res.json({ content: platformSpecificContent.common });
    } else if (platformSpecificContent[platform]) {
      res.json({ content: platformSpecificContent[platform] });
    } else {
      res.status(400).json({ error: 'Invalid platform specified' });
    }
  }, 1000);
});

// Post content API (simulated)
app.post('/api/post', (req, res) => {
  const { platform, content } = req.body;

  // In a real app, this would connect to social media APIs
  console.log(`Posting to ${platform}:`, content);

  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: `Content successfully posted to ${platform}`,
      postId: `post-${Date.now()}`
    });
  }, 1000);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
