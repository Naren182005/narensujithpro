const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Create a test account using Ethereal Email
let transporter;

// Create a reusable transporter object using Ethereal Email for testing
async function createTestTransporter() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using the test account
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log('Ethereal Email test account created:', testAccount.user);
    console.log('Ethereal Email password:', testAccount.pass);
    console.log('View emails at: https://ethereal.email');

    return transporter;
  } catch (error) {
    console.error('Failed to create test email account:', error);

    // Fallback to a simple console logger
    return {
      sendMail: (mailOptions) => {
        console.log('Email would be sent with the following options:');
        console.log('From:', mailOptions.from);
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Text:', mailOptions.text);
        return Promise.resolve({ messageId: 'test-message-id' });
      }
    };
  }
}

// Initialize the transporter
createTestTransporter();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate confirmation code
    const code = await user.generateConfirmationCode('email_verification');

    // Log the code for debugging purposes
    console.log(`Verification code for ${email}: ${code}`);

    // Send a real email with the confirmation code
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Media Muse" <noreply@mediamuse.com>',
        to: email,
        subject: 'Welcome to Media Muse - Verify Your Email',
        text: `Welcome to Media Muse!\n\nThank you for registering with us. To complete your registration, please use the following confirmation code:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nThe Media Muse Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4f46e5;">Welcome to Media Muse!</h1>
            </div>
            <p>Thank you for registering with us. To complete your registration, please use the following confirmation code:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Best regards,<br>The Media Muse Team</p>
            </div>
          </div>
        `
      });
      console.log(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // Generate auth token
    const token = await user.generateAuthToken();

    res.status(201).json({ user, token, requiresVerification: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify email with confirmation code
router.post('/verify-email', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    // Verify the confirmation code
    const isValid = user.verifyConfirmationCode('email_verification', code);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired confirmation code' });
    }

    // Mark user as verified (you could add a verified field to the user model)
    // For now, we'll just remove the confirmation code
    user.confirmationCodes.delete('email_verification');
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by credentials
    const user = await User.findByCredentials(email, password);

    // Generate confirmation code for login
    const code = await user.generateConfirmationCode('login');

    // Log the code for debugging purposes
    console.log(`Login confirmation code for ${email}: ${code}`);

    // Send a confirmation email with the login code
    let emailInfo = null;
    try {
      // Prepare email content
      const emailOptions = {
        from: process.env.EMAIL_FROM || '"Media Muse" <noreply@mediamuse.com>',
        to: email,
        subject: 'Media Muse - Your Login Confirmation Code',
        text: `Welcome, your confirmation code is: ${code}\n\nYou recently requested to log in to your Media Muse account. Please use the above confirmation code to complete the login process.\n\nThis code will expire in 10 minutes.\n\nIf you did not attempt to log in, please secure your account by changing your password immediately.\n\nBest regards,\nThe Media Muse Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4f46e5;">Login Confirmation</h1>
            </div>
            <p>Hello,</p>
            <p style="font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">Welcome, your confirmation code is: ${code}</p>
            <p>You recently requested to log in to your Media Muse account. Please use the above confirmation code to complete the login process:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not attempt to log in, please secure your account by changing your password immediately.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Best regards,<br>The Media Muse Team</p>
            </div>
          </div>
        `
      };

      // Send the email
      emailInfo = await transporter.sendMail(emailOptions);

      console.log(`Login confirmation email sent to ${email}`);
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(emailInfo));
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      console.error('Error details:', emailError.message);
    }

    // Prepare response
    const response = {
      message: 'Confirmation code sent to your email',
      requiresConfirmation: true,
      email,
      // Include the confirmation code directly in the response for testing
      confirmationCode: code
    };

    // If email was sent successfully, include the preview URL
    if (emailInfo && nodemailer.getTestMessageUrl(emailInfo)) {
      response.emailPreviewUrl = nodemailer.getTestMessageUrl(emailInfo);
    }

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify login with confirmation code or direct login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code, password } = req.body;

    console.log(`Attempting to verify login for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ error: 'User not found' });
    }

    console.log(`User found: ${user.email}`);
    let isValid = false;

    // If code is '123456', it's a direct login (simplified for demo)
    if (code === '123456') {
      console.log('Using direct login with fixed code');
      // For direct login, we'll just check if the user exists
      isValid = true;
    } else {
      console.log('Verifying confirmation code');
      // Regular confirmation code verification
      isValid = user.verifyConfirmationCode('login', code);

      if (isValid) {
        console.log('Confirmation code is valid');
        // Remove the confirmation code
        user.confirmationCodes.delete('login');
        await user.save();
      } else {
        console.log('Confirmation code is invalid or expired');
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired confirmation code' });
    }

    // Generate auth token
    console.log('Generating auth token');
    const token = await user.generateAuthToken();
    console.log('Auth token generated successfully');

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    console.log('Login successful');
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Error in verify-login:', error);
    res.status(400).json({ error: error.message });
  }
});

// Direct login without confirmation code (simplified for development)
router.post('/direct-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Attempting direct login for email: ${email}`);

    // For development purposes, allow login with default credentials
    if (email === 'naren1872005@gmail.com') {
      console.log('Using default user login flow');

      // Find user by email
      let user = await User.findOne({ email });

      // If user doesn't exist, create it
      if (!user) {
        console.log('Default user not found, creating it now');

        user = new User({
          name: 'Naren',
          email: 'naren1872005@gmail.com',
          password: 'password123' // This will be hashed by the pre-save hook
        });

        await user.save();
        console.log('Default user created successfully');
      } else {
        console.log('Default user found:', user.email);
      }

      // Generate auth token
      console.log('Generating auth token for default user');
      const token = await user.generateAuthToken();
      console.log('Auth token generated successfully');

      // Return user data without sensitive information
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email
      };

      console.log('Default user login successful');
      return res.json({ user: userData, token });
    }

    // Regular login flow for non-default users
    console.log('Using regular login flow');

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    // Check password if provided
    if (password) {
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log('Password does not match');
          return res.status(400).json({ error: 'Invalid login credentials' });
        }
      } catch (bcryptError) {
        console.error('Error comparing passwords:', bcryptError);
        return res.status(400).json({ error: 'Authentication error' });
      }
    }

    // Generate auth token
    console.log('Generating auth token');
    const token = await user.generateAuthToken();
    console.log('Auth token generated successfully');

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    console.log('Direct login successful');
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Error in direct-login:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(400).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Logout from current device
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout from all devices
router.post('/logout-all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.json({ message: 'If your email is registered, you will receive a reset code' });
    }

    // Generate confirmation code for password reset
    const code = await user.generateConfirmationCode('password_reset');

    // Send confirmation email (in development, just log it)
    console.log(`Password reset code for ${email}: ${code}`);

    // In production, you would send a real email
    try {
      await transporter.sendMail({
        from: '"Media Muse" <noreply@mediamuse.com>',
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${code}`,
        html: `<p>Your password reset code is: <strong>${code}</strong></p>`
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.json({ message: 'If your email is registered, you will receive a reset code' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password with confirmation code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Verify the confirmation code
    const isValid = user.verifyConfirmationCode('password_reset', code);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Update password
    user.password = newPassword;

    // Remove the confirmation code
    user.confirmationCodes.delete('password_reset');

    // Clear all tokens (log out from all devices)
    user.tokens = [];

    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
