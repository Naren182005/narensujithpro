const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const router = express.Router();

/**
 * Google OAuth Authentication Route
 * 
 * This endpoint handles Google OAuth authentication by:
 * 1. Receiving the Google credential token from the frontend
 * 2. Verifying the token (in production, you'd verify with Google's API)
 * 3. Creating or updating the user in the database
 * 4. Returning a JWT token for the application
 */
router.post('/google', async (req, res) => {
  try {
    const { googleToken, user } = req.body;

    if (!googleToken || !user) {
      return res.status(400).json({
        success: false,
        message: 'Google token and user information are required'
      });
    }

    // In production, you would verify the Google token with Google's API
    // For now, we'll trust the frontend verification
    
    // Check if user already exists
    let existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      // Update existing user with Google information
      existingUser.name = user.name || existingUser.name;
      existingUser.googleId = user.id;
      existingUser.profilePicture = user.picture || existingUser.profilePicture;
      existingUser.lastLogin = new Date();
      existingUser.loginMethod = 'google';
      
      await existingUser.save();
      
      console.log('Existing user logged in with Google:', existingUser.email);
    } else {
      // Create new user
      existingUser = new User({
        name: user.name,
        email: user.email,
        googleId: user.id,
        profilePicture: user.picture,
        lastLogin: new Date(),
        loginMethod: 'google',
        emailVerified: user.verified_email || true, // Google emails are typically verified
        // No password needed for Google auth users
      });

      await existingUser.save();
      console.log('New user created with Google auth:', existingUser.email);
    }

    // Generate JWT token for the application
    const token = jwt.sign(
      { 
        userId: existingUser._id,
        email: existingUser.email,
        loginMethod: 'google'
      },
      config.jwtSecret,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return success response
    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        profilePicture: existingUser.profilePicture,
        loginMethod: existingUser.loginMethod,
        lastLogin: existingUser.lastLogin
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Verify JWT Token Route
 * 
 * This endpoint verifies if a JWT token is valid and returns user information
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        loginMethod: user.loginMethod,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

/**
 * Logout Route
 * 
 * This endpoint handles user logout
 * Note: With JWT tokens, logout is typically handled on the frontend by removing the token
 * This endpoint can be used for additional cleanup if needed
 */
router.post('/logout', async (req, res) => {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just return a success response
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

/**
 * Refresh Token Route
 * 
 * This endpoint can be used to refresh an existing JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify the current token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        loginMethod: user.loginMethod
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
