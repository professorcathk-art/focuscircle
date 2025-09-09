const nodemailer = require('nodemailer');

// Create transporter (using SendGrid or other email service)
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // Using SendGrid
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Fallback to Gmail or other SMTP
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

const sendEmail = async (to, subject, html, text = null) => {
  try {
    // Skip email sending if no email configuration is available
    if (!process.env.SENDGRID_API_KEY && !process.env.EMAIL_USER) {
      console.log('Email service not configured - skipping email send');
      return { success: true, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@focuscircle.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - FocusCircle</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to FocusCircle!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up for FocusCircle. To complete your registration and start tracking your favorite websites, please verify your email address by clicking the button below:</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with FocusCircle, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 FocusCircle. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, 'Verify Your Email - FocusCircle', html);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - FocusCircle</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your FocusCircle Password</h2>
          <p>We received a request to reset your password for your FocusCircle account. If you made this request, click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 10 minutes for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2024 FocusCircle. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, 'Reset Your Password - FocusCircle', html);
};

const sendWelcomeEmail = async (email, firstName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FocusCircle!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to FocusCircle, ${firstName}!</h1>
        </div>
        <div class="content">
          <h2>Your AI-Powered News Tracking Journey Begins</h2>
          <p>Thank you for joining FocusCircle! You're now part of a community that values efficient information consumption and intelligent content curation.</p>
          
          <div class="feature">
            <h3>🚀 What's Next?</h3>
            <p>Start by adding websites you want to track. Our AI will monitor them and provide you with intelligent summaries.</p>
          </div>
          
          <div class="feature">
            <h3>🎯 Key Features</h3>
            <ul>
              <li><strong>Smart Summarization:</strong> Get AI-powered summaries of your tracked websites</li>
              <li><strong>Priority Classification:</strong> Content is automatically categorized as Tier 1 (critical) or Tier 2 (informational)</li>
              <li><strong>Personalized Learning:</strong> The system learns from your feedback to improve recommendations</li>
              <li><strong>Flexible Monitoring:</strong> Set custom monitoring frequencies for each website</li>
            </ul>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
          
          <p>Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/help">help center</a> or reply to this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 FocusCircle. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, 'Welcome to FocusCircle!', html);
};

const sendDailyDigest = async (email, firstName, summaries) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily FocusCircle Digest</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .summary { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #F59E0B; }
        .tier1 { border-left-color: #EF4444; }
        .tier2 { border-left-color: #10B981; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Daily Digest</h1>
          <p>Hello ${firstName}, here's what's happening in your tracked websites</p>
        </div>
        <div class="content">
          ${summaries.map(summary => `
            <div class="summary ${summary.classification.tier}">
              <h3>${summary.title}</h3>
              <p><strong>Source:</strong> ${summary.websiteId.title}</p>
              <p>${summary.content.summary}</p>
              <p><a href="${summary.originalUrl}" target="_blank">Read Original</a></p>
            </div>
          `).join('')}
          
          <p><a href="${process.env.FRONTEND_URL}/dashboard">View All Summaries</a></p>
        </div>
        <div class="footer">
          <p>© 2024 FocusCircle. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Your Daily FocusCircle Digest - ${new Date().toLocaleDateString()}`, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendDailyDigest
};
