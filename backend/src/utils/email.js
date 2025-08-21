const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const getEmailTemplate = (template, data) => {
  switch (template) {
    case 'verification':
      return {
        subject: 'Verify Your Reiki Healing Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Welcome to Reiki Healing Platform!</h2>
            <p>Dear ${data.firstName},</p>
            <p>Thank you for joining our Reiki healing community. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
            </div>
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Reiki Healing Team</p>
          </div>
        `
      };

    case 'password-reset':
      return {
        subject: 'Reset Your Reiki Healing Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Password Reset Request</h2>
            <p>Dear ${data.firstName},</p>
            <p>We received a request to reset your password for your Reiki Healing account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Reiki Healing Team</p>
          </div>
        `
      };

    case 'appointment-confirmation':
      return {
        subject: 'Appointment Confirmation - Reiki Healing',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Appointment Confirmed</h2>
            <p>Dear ${data.clientName},</p>
            <p>Your Reiki healing appointment has been confirmed with the following details:</p>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Therapist:</strong> ${data.therapistName}</p>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
              <p><strong>Session Type:</strong> ${data.sessionType}</p>
              <p><strong>Price:</strong> $${data.price}</p>
            </div>
            <p>Please arrive 5-10 minutes early for your appointment. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            <p>Best regards,<br>The Reiki Healing Team</p>
          </div>
        `
      };

    case 'appointment-reminder':
      return {
        subject: 'Appointment Reminder - Tomorrow',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Appointment Reminder</h2>
            <p>Dear ${data.clientName},</p>
            <p>This is a friendly reminder that you have a Reiki healing appointment tomorrow:</p>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Therapist:</strong> ${data.therapistName}</p>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Duration:</strong> ${data.duration} minutes</p>
            </div>
            <p>Please arrive 5-10 minutes early. We look forward to seeing you!</p>
            <p>Best regards,<br>The Reiki Healing Team</p>
          </div>
        `
      };

    default:
      return {
        subject: 'Notification from Reiki Healing',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Reiki Healing Platform</h2>
            <p>${data.message}</p>
            <p>Best regards,<br>The Reiki Healing Team</p>
          </div>
        `
      };
  }
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent;
    if (template && data) {
      emailContent = getEmailTemplate(template, data);
      subject = subject || emailContent.subject;
      html = emailContent.html;
    }

    const mailOptions = {
      from: `"Reiki Healing Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const result = await sendEmail(email);
        results.push({ success: true, email: email.to, messageId: result.messageId });
      } catch (error) {
        results.push({ success: false, email: email.to, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails
};
