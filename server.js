const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { generateWithChatGPT } = require('./server/chatgpt-service');
const socialAuthManager = require('./server/social-auth-service');
const { postToSocialMedia, postToMultiplePlatforms } = require('./server/social-post-service');
const { summarizeText, generateContent } = require('./server/groq-service');
const { sendWelcomeEmail } = require('./server/email-service');

// Import database connection and routes
const connectDB = require('./server/db/mongoose');
const authRoutes = require('./server/routes/auth');
const userRoutes = require('./server/routes/users');

const app = express();
const PORT = process.env.PORT || 3001; // Using port 3001 to match frontend expectations

console.log('Starting server...');
console.log('PORT:', PORT);

// Initialize database connection with timeout
const initializeDatabase = async () => {
  try {
    console.log('🔗 Attempting database connection...');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );

    await Promise.race([connectDB(), timeoutPromise]);
    console.log('✅ Database connected successfully');
    return true;
  } catch (err) {
    console.error('⚠️ Database connection failed:', err.message);
    console.log('   Server will continue without database (using fallback storage)');
    return false;
  }
};

// Initialize database in background
initializeDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Content generation API
app.post('/api/generate', async (req, res) => {
  try {
    console.log(`=== SERVER.JS: START GENERATE CONTENT API ENDPOINT ===`);
    console.log(`SERVER.js: Received request at /api/generate`);
    console.log(`SERVER.js: Request method: ${req.method}`);
    console.log(`SERVER.js: Request headers:`, req.headers);
    console.log(`SERVER.js: Request body:`, req.body);
    console.log(`SERVER.js: Request body type: ${typeof req.body}`);

    // Extract platform and prompt from request body
    const { platform, prompt } = req.body;

    console.log(`SERVER.js: Extracted platform: "${platform}"`);
    console.log(`SERVER.js: Extracted prompt: "${prompt}"`);
    console.log(`SERVER.js: Prompt length: ${prompt ? prompt.length : 0} characters`);

    // Validate platform
    if (!platform) {
      console.error(`SERVER.js: Missing platform in request`);
      console.log(`=== SERVER.JS: END GENERATE CONTENT API ENDPOINT WITH ERROR ===`);
      return res.status(400).json({ error: 'Platform is required' });
    }

    // Validate keywords/prompt
    if (!prompt || !prompt.trim()) {
      console.error(`SERVER.js: Missing keywords/prompt in request`);
      console.log(`=== SERVER.JS: END GENERATE CONTENT API ENDPOINT WITH ERROR ===`);
      return res.status(400).json({ error: 'Keywords are required for content generation' });
    }

    // Generate content using Llama model via Groq API
    console.log(`SERVER.js: Calling generateContent with platform: "${platform}"`);
    console.log(`SERVER.js: Using prompt: "${prompt}"`);
    console.log(`SERVER.js: Prompt will be used to generate content specific to these topics`);

    // Call the Groq service to generate content
    console.log(`SERVER.js: Calling Groq service generateContent function...`);
    const content = await generateContent(platform, prompt);
    console.log(`SERVER.js: Received response from Groq service`);

    // Validate content
    if (!content) {
      console.error(`SERVER.js: No content generated for platform: ${platform}`);
      console.log(`=== SERVER.JS: END GENERATE CONTENT API ENDPOINT WITH ERROR ===`);
      return res.status(500).json({ error: 'No content generated' });
    }

    console.log(`SERVER.js: Successfully generated content for ${platform}`);
    console.log(`SERVER.js: Content type: ${typeof content}`);
    console.log(`SERVER.js: Content length: ${typeof content === 'string' ? content.length : JSON.stringify(content).length} characters`);
    console.log(`SERVER.js: Content preview: ${typeof content === 'object' ? JSON.stringify(content).substring(0, 100) + '...' : content.substring(0, 100) + '...'}`);

    // Prepare response
    const responseData = { content };
    console.log(`SERVER.js: Preparing response:`, responseData);

    // Send response
    console.log(`SERVER.js: Sending response with status 200`);
    res.json(responseData);
    console.log(`=== SERVER.JS: END GENERATE CONTENT API ENDPOINT ===`);
  } catch (error) {
    console.error(`SERVER.js: Error in generate endpoint:`, error);
    console.error(`SERVER.js: Error message: ${error.message}`);
    console.error(`SERVER.js: Error stack: ${error.stack}`);
    console.log(`=== SERVER.JS: END GENERATE CONTENT API ENDPOINT WITH ERROR ===`);
    res.status(500).json({ error: `Failed to generate content: ${error.message}` });
  }
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

// Social Media Authentication API
app.get('/api/auth/url/:platform', (req, res) => {
  const { platform } = req.params;

  try {
    const authUrl = socialAuthManager.getAuthUrl(platform);
    res.json({ url: authUrl });
  } catch (error) {
    console.error(`Error getting auth URL for ${platform}:`, error);
    res.status(500).json({ error: `Failed to get auth URL for ${platform}` });
  }
});

// Social Media Authentication Callback
app.post('/api/auth/callback', async (req, res) => {
  const { platform, code } = req.body;

  try {
    const result = await socialAuthManager.handleAuthCallback(platform, code);
    res.json(result);
  } catch (error) {
    console.error(`Error handling auth callback for ${platform}:`, error);
    res.status(500).json({ error: `Failed to authenticate with ${platform}` });
  }
});

// Facebook OAuth Callback Route
app.get('/auth/facebook/callback', async (req, res) => {
  console.log('Facebook OAuth callback received:', {
    query: req.query,
    code: req.query.code ? `${req.query.code.substring(0, 10)}...` : null
  });

  const { code } = req.query;

  if (!code) {
    console.error('Facebook OAuth callback: Authorization code is missing');
    return res.status(400).send('Authorization code is missing');
  }

  try {
    // Handle the Facebook OAuth callback
    console.log('Handling Facebook OAuth callback with code');
    const result = await socialAuthManager.handleAuthCallback('facebook', code);

    console.log('Facebook OAuth callback result:', {
      success: result.success,
      token: result.token ? `${result.token.substring(0, 10)}...` : null,
      error: result.error
    });

    if (result.success) {
      // Redirect to the frontend with success
      const redirectUrl = `http://localhost:8080/auth-success?platform=facebook&token=${result.token}`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } else {
      // Redirect to the frontend with error
      const redirectUrl = `http://localhost:8080/auth-error?platform=facebook&error=${encodeURIComponent(result.error || 'Unknown error')}`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error handling Facebook OAuth callback:', error);
    const redirectUrl = `http://localhost:8080/auth-error?platform=facebook&error=${encodeURIComponent(error.message || 'Unknown error')}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
});

// Facebook Token Authentication Endpoint
app.post('/api/auth/facebook/token', async (req, res) => {
  console.log('Facebook token authentication request received');

  const { token } = req.body;

  if (!token) {
    console.error('Facebook token authentication: Token is missing');
    return res.status(400).json({
      success: false,
      error: 'Facebook access token is required'
    });
  }

  try {
    // Authenticate with the provided token
    console.log('Authenticating with Facebook token');

    // Get user profile with the access token
    const userProfile = await socialAuthManager.getFacebookUserProfile(token);

    // Store the token and profile
    socialAuthManager.authTokens.facebook = token;
    socialAuthManager.isAuthenticated.facebook = true;
    socialAuthManager.userProfiles.facebook = userProfile;

    console.log('Facebook token authentication successful');

    // Return success response
    res.json({
      success: true,
      platform: 'facebook',
      token,
      profile: userProfile
    });
  } catch (error) {
    console.error('Error authenticating with Facebook token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to authenticate with Facebook token'
    });
  }
});

// Get authentication status
app.get('/api/auth/status', (req, res) => {
  const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
  const status = {};

  platforms.forEach(platform => {
    status[platform] = {
      authenticated: socialAuthManager.isAuthenticatedWith(platform),
      profile: socialAuthManager.getUserProfile(platform)
    };
  });

  res.json({
    allAuthenticated: socialAuthManager.isAuthenticatedWithAll(),
    platforms: status
  });
});

// Logout from a platform
app.post('/api/auth/logout/:platform', (req, res) => {
  const { platform } = req.params;

  try {
    const success = socialAuthManager.logout(platform);
    res.json({ success });
  } catch (error) {
    console.error(`Error logging out from ${platform}:`, error);
    res.status(500).json({ error: `Failed to logout from ${platform}` });
  }
});

// Logout from all platforms
app.post('/api/auth/logout', (req, res) => {
  try {
    socialAuthManager.logoutAll();
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging out from all platforms:', error);
    res.status(500).json({ error: 'Failed to logout from all platforms' });
  }
});

// Post to a specific platform
app.post('/api/post/:platform', async (req, res) => {
  const { platform } = req.params;
  const { content, mediaFiles } = req.body;

  try {
    const result = await postToSocialMedia(platform, content, mediaFiles);
    res.json(result);
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    res.status(500).json({ error: `Failed to post to ${platform}` });
  }
});

// Post to multiple platforms
app.post('/api/post/multiple', async (req, res) => {
  const { platformsContent, mediaFiles } = req.body;

  try {
    const results = await postToMultiplePlatforms(platformsContent, mediaFiles);
    res.json(results);
  } catch (error) {
    console.error('Error posting to multiple platforms:', error);
    res.status(500).json({ error: 'Failed to post to multiple platforms' });
  }
});

// For demo purposes, add an endpoint to simulate authentication
app.post('/api/auth/simulate', async (req, res) => {
  const { platform } = req.body;

  try {
    // Simulate authentication with a fake code
    const fakeCode = `fake_code_${Date.now()}`;
    const result = await socialAuthManager.handleAuthCallback(platform, fakeCode);
    res.json(result);
  } catch (error) {
    console.error(`Error simulating auth for ${platform}:`, error);
    res.status(500).json({ error: `Failed to simulate auth for ${platform}` });
  }
});

// Standard login endpoint (for enhanced auth service)
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Standard login attempt:', { email });

  // For demo purposes, accept any login with valid format
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Simple validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  // Generate a fake token
  const token = `demo_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Return success with token
  res.json({
    success: true,
    token,
    user: {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      picture: 'https://via.placeholder.com/150',
      role: 'user'
    },
    message: 'Login successful!'
  });
});

// Direct login endpoint for the login page
app.post('/api/users/direct-login', (req, res) => {
  const { email, password } = req.body;

  console.log('Direct login attempt:', { email });

  // For demo purposes, accept any login with valid format
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Simple validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Generate a fake token
  const token = `demo_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Return success with token
  res.json({
    success: true,
    token,
    user: {
      id: '123456',
      email,
      name: email.split('@')[0],
      role: 'user'
    }
  });
});

// Endpoint to generate content for all platforms at once
app.post('/api/generate-all', async (req, res) => {
  try {
    console.log(`=== SERVER.JS: START GENERATE ALL CONTENT API ENDPOINT ===`);
    console.log(`SERVER.js: Received request at /api/generate-all`);
    console.log(`SERVER.js: Request method: ${req.method}`);
    console.log(`SERVER.js: Request headers:`, req.headers);
    console.log(`SERVER.js: Request body:`, req.body);

    // Extract prompt from request body
    const { prompt } = req.body;

    console.log(`SERVER.js: Extracted prompt: "${prompt}"`);
    console.log(`SERVER.js: Prompt length: ${prompt ? prompt.length : 0} characters`);

    // Validate prompt
    if (!prompt || !prompt.trim()) {
      console.error(`SERVER.js: Missing prompt in request`);
      console.log(`=== SERVER.JS: END GENERATE ALL CONTENT API ENDPOINT WITH ERROR ===`);
      return res.status(400).json({ error: 'Prompt is required for content generation' });
    }

    console.log(`SERVER.js: Generating content for all platforms with prompt: "${prompt}"`);

    // Generate content for all platforms in parallel
    const [linkedinContent, instagramContent, facebookContent, youtubeContent] = await Promise.all([
      generateContent('linkedin', prompt),
      generateContent('instagram', prompt),
      generateContent('facebook', prompt),
      generateContent('youtube', prompt)
    ]);

    console.log(`SERVER.js: Successfully generated content for all platforms`);

    // Create response object
    const response = {
      linkedin: linkedinContent,
      instagram: instagramContent,
      facebook: facebookContent,
      youtube: youtubeContent
    };

    console.log(`SERVER.js: Sending response with content for all platforms`);
    res.json(response);
    console.log(`=== SERVER.JS: END GENERATE ALL CONTENT API ENDPOINT ===`);
  } catch (error) {
    console.error(`SERVER.js: Error generating content for all platforms:`, error);
    console.error(`SERVER.js: Error message: ${error.message}`);
    console.error(`SERVER.js: Error stack: ${error.stack}`);
    console.log(`=== SERVER.JS: END GENERATE ALL CONTENT API ENDPOINT WITH ERROR ===`);
    res.status(500).json({ error: `Failed to generate content: ${error.message}` });
  }
});

// Summarization API endpoint using Llama 4 from Groq
app.post('/api/summarize', async (req, res) => {
  try {
    console.log('Received summarization request');

    // Extract text and options from request body
    const { text, maxLength, minLength } = req.body;

    // Validate input
    if (!text) {
      console.error('Missing text in request');
      return res.status(400).json({ error: 'Text to summarize is required' });
    }

    // Check text length
    if (text.length < 100) {
      console.error('Text too short for summarization');
      return res.status(400).json({ error: 'Text must be at least 100 characters long for summarization' });
    }

    console.log(`Summarizing text of length ${text.length} characters`);

    // Call the Groq service to summarize the text
    const summary = await summarizeText(text, {
      maxLength: maxLength || 200,
      minLength: minLength || 50
    });

    console.log('Successfully generated summary');

    // Send the summary as response
    res.json({
      summary,
      original_length: text.length,
      summary_length: summary.length,
      reduction_percentage: Math.round((1 - (summary.length / text.length)) * 100)
    });
  } catch (error) {
    console.error('Error in summarize endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: `Failed to summarize text: ${error.message}` });
  }
});

// User registration endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('=== SERVER.JS: START USER REGISTRATION API ENDPOINT ===');
    console.log('SERVER.js: Received registration request');

    // Extract user data from request body
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.error('SERVER.js: Missing required fields in registration request');
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('SERVER.js: Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      console.error('SERVER.js: Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    console.log(`SERVER.js: Registering user with email: ${email}`);

    // In a real app, you would hash the password and store the user in a database
    // For this demo, we'll just simulate a successful registration

    // Generate a fake user ID and token
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Send welcome email
    console.log('SERVER.js: Sending welcome email');
    const emailResult = await sendWelcomeEmail(email, name);

    if (emailResult.error) {
      console.warn(`SERVER.js: Warning - Welcome email could not be sent: ${emailResult.error}`);
      // Continue with registration even if email fails
    } else {
      console.log('SERVER.js: Welcome email sent successfully');
    }

    // Return success response
    console.log('SERVER.js: Registration successful');
    console.log('=== SERVER.JS: END USER REGISTRATION API ENDPOINT ===');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Social Sync.',
      emailSent: !emailResult.error,
      user: {
        id: userId,
        name,
        email
      },
      token
    });
  } catch (error) {
    console.error('SERVER.js: Error in registration endpoint:', error);
    console.error('SERVER.js: Error message:', error.message);
    console.error('SERVER.js: Error stack:', error.stack);
    console.log('=== SERVER.JS: END USER REGISTRATION API ENDPOINT WITH ERROR ===');
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
