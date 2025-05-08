const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verifySocialCredentials } = require('../services/social-verification');

// Create a real email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Get all social accounts for the current user
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;

    res.json({ socialAccounts: user.socialAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify social media credentials
router.post('/verify-credentials', async (req, res) => {
  try {
    const { platform, username, password } = req.body;

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Verify credentials with the platform
    const verificationResult = await verifySocialCredentials(platform, username, password);

    // Return the verification result
    res.json(verificationResult);
  } catch (error) {
    console.error(`Error verifying credentials:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify credentials'
    });
  }
});

// Send confirmation code for social account connection
router.post('/send-confirmation', auth, async (req, res) => {
  try {
    const { email, platform } = req.body;
    const user = req.user;

    // Generate confirmation code
    const codeType = `social_${platform}`;
    const code = await user.generateConfirmationCode(codeType);

    // Log the code for debugging purposes
    console.log(`Social account confirmation code for ${email} (${platform}): ${code}`);

    // Send a real email with the social account confirmation code
    try {
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Media Muse" <noreply@mediamuse.com>',
        to: email,
        subject: `Media Muse - Confirm Your ${platformName} Account Connection`,
        text: `Hello,\n\nYou recently requested to connect your ${platformName} account to Media Muse. Please use the following confirmation code to complete the connection process:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this connection, please ignore this email.\n\nBest regards,\nThe Media Muse Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4f46e5;">Connect Your ${platformName} Account</h1>
            </div>
            <p>Hello,</p>
            <p>You recently requested to connect your ${platformName} account to Media Muse. Please use the following confirmation code to complete the connection process:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you did not request this connection, please ignore this email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Best regards,<br>The Media Muse Team</p>
            </div>
          </div>
        `
      });
      console.log(`Social account confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.json({
      message: 'Confirmation code sent',
      success: true,
      // Include the confirmation code directly in the response for testing
      confirmationCode: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect a social media account
router.post('/connect/:platform', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { username, password, email, confirmationCode } = req.body;
    const user = req.user;

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    // Verify the confirmation code
    const codeType = `social_${platform}`;
    const isValid = user.verifyConfirmationCode(codeType, confirmationCode);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired confirmation code' });
    }

    // Verify the social media credentials
    const verificationResult = await verifySocialCredentials(platform, username, password);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${platform} credentials. Please check your username and password.`
      });
    }

    // Create the social account object
    const socialAccount = {
      username,
      accountId: username, // Use username as account ID
      password,
      email,
      verified: true,
      accessToken: `token_${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      profileUrl: `https://${platform}.com/${username}`,
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      connectedAt: new Date(),
    };

    // Add the account to the user's social accounts
    user.socialAccounts[platform].push(socialAccount);

    // Remove the confirmation code
    user.confirmationCodes.delete(codeType);

    await user.save();

    res.json({
      success: true,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully`,
      account: socialAccount
    });
  } catch (error) {
    console.error(`Error connecting ${platform} account:`, error);
    res.status(500).json({
      success: false,
      message: error.message || `Failed to connect ${platform} account`
    });
  }
});

// Disconnect a social media account
router.delete('/disconnect/:platform/:accountId', auth, async (req, res) => {
  try {
    const { platform, accountId } = req.params;
    const user = req.user;

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Find the account index
    const accountIndex = user.socialAccounts[platform].findIndex(
      account => account.accountId === accountId
    );

    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Remove the account
    user.socialAccounts[platform].splice(accountIndex, 1);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a social media account
router.patch('/update/:platform/:accountId', auth, async (req, res) => {
  try {
    const { platform, accountId } = req.params;
    const updates = req.body;
    const user = req.user;

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Find the account
    const account = user.socialAccounts[platform].find(
      account => account.accountId === accountId
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['username', 'password', 'email'];
    const updateKeys = Object.keys(updates);

    const isValidOperation = updateKeys.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    // Apply updates
    updateKeys.forEach(update => {
      account[update] = updates[update];
    });

    // If email is updated, mark as unverified and require confirmation
    if (updates.email && updates.email !== account.email) {
      account.verified = false;

      // Generate confirmation code
      const codeType = `social_update_${platform}_${accountId}`;
      const code = await user.generateConfirmationCode(codeType);

      // Send confirmation email (in development, just log it)
      console.log(`Social account update confirmation code for ${updates.email} (${platform}): ${code}`);

      // In production, you would send a real email
      try {
        await transporter.sendMail({
          from: '"Media Muse" <noreply@mediamuse.com>',
          to: updates.email,
          subject: `Confirm Your ${platform.charAt(0).toUpperCase() + platform.slice(1)} Account Update`,
          text: `Your confirmation code is: ${code}`,
          html: `<p>Your confirmation code for updating your ${platform} account is: <strong>${code}</strong></p>`
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      await user.save();

      return res.json({
        success: true,
        requiresConfirmation: true,
        message: 'Confirmation code sent to your new email'
      });
    }

    await user.save();

    res.json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify updated social media account email
router.post('/verify-update/:platform/:accountId', auth, async (req, res) => {
  try {
    const { platform, accountId } = req.params;
    const { confirmationCode } = req.body;
    const user = req.user;

    // Validate platform
    const validPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Find the account
    const account = user.socialAccounts[platform].find(
      account => account.accountId === accountId
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Verify the confirmation code
    const codeType = `social_update_${platform}_${accountId}`;
    const isValid = user.verifyConfirmationCode(codeType, confirmationCode);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired confirmation code' });
    }

    // Mark as verified
    account.verified = true;

    // Remove the confirmation code
    user.confirmationCodes.delete(codeType);

    await user.save();

    res.json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
