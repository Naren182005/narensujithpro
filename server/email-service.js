const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
  }
});

/**
 * Send a welcome email to a newly registered user
 * @param {string} email - The recipient's email address
 * @param {string} name - The recipient's name
 * @returns {Promise<Object>} - The result of the email sending operation
 */
async function sendWelcomeEmail(email, name = 'there') {
  try {
    console.log(`Sending welcome email to ${email}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Social Sync" <noreply@socialsync.com>',
      to: email,
      subject: 'Welcome to Social Sync!',
      text: `Hello ${name},\n\nThank you for registering with Social Sync! We're excited to have you on board.\n\nWith Social Sync, you can easily manage and generate content for all your social media platforms in one place.\n\nIf you have any questions or need assistance, please don't hesitate to contact our support team.\n\nBest regards,\nThe Social Sync Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Welcome to Social Sync!</h1>
          </div>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Social Sync! We're excited to have you on board.</p>
          <p>With Social Sync, you can easily manage and generate content for all your social media platforms in one place.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4f46e5;">What you can do with Social Sync:</h3>
            <ul>
              <li>Generate AI-powered content for multiple platforms</li>
              <li>Schedule and post content directly to your social media accounts</li>
              <li>Analyze performance and engagement metrics</li>
              <li>Manage all your social media presence from one dashboard</li>
            </ul>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Best regards,<br>The Social Sync Team</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw the error, just log it - we don't want to break the registration flow
    return { error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail
};
