const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { sendEmail } = require('../utils/email');
const { validateToken } = require('../middleware/auth');

const router = express.Router();

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

// Store refresh token
const storeRefreshToken = async (userId, refreshToken, deviceInfo = null) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await executeQuery(
    'INSERT INTO refresh_tokens (user_id, token, expires_at, device_info) VALUES (?, ?, ?, ?)',
    [userId, refreshToken, expiresAt, deviceInfo]
  );
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').optional().isIn(['client', 'therapist'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, role = 'client' } = req.body;

    // Check if user already exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const result = await executeQuery(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, email_verification_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone, role, verificationToken]
    );

    const userId = result.insertId;

    // If therapist, create therapist profile
    if (role === 'therapist') {
      await executeQuery(
        'INSERT INTO therapist_profiles (user_id) VALUES (?)',
        [userId]
      );
    }

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Reiki Healing Account',
        template: 'verification',
        data: {
          firstName,
          verificationToken,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId,
        email,
        firstName,
        lastName,
        role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, deviceInfo } = req.body;

    // Find user
    const users = await executeQuery(
      'SELECT id, email, password_hash, first_name, last_name, role, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken, deviceInfo);

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty()
], async (req, res) => {
  try {
    const { token } = req.body;

    const users = await executeQuery(
      'SELECT id, email, first_name FROM users WHERE verification_token = ? AND is_verified = FALSE',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    const user = users[0];

    // Update user as verified
    await executeQuery(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: user.email,
        firstName: user.first_name
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
});

// Refresh token
router.post('/refresh', [
  body('refreshToken').notEmpty()
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in database
    const tokens = await executeQuery(
      'SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokens.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid'
      });
    }

    const userId = tokens[0].user_id;

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

    // Remove old refresh token and store new one
    await executeQuery('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    await storeRefreshToken(userId, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// Logout
router.post('/logout', validateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await executeQuery('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const users = await executeQuery(
      'SELECT id, first_name FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    const user = users[0];
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour from now

    await executeQuery(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Reset Your Reiki Healing Password',
        template: 'password-reset',
        data: {
          firstName: user.first_name,
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { token, password } = req.body;

    const users = await executeQuery(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await executeQuery(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

module.exports = router;
