const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { executeQuery } = require('../config/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const users = await executeQuery(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, 
              address, profile_image, role, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // If user is a therapist, get therapist profile
    if (user.role === 'therapist') {
      const therapistProfiles = await executeQuery(
        `SELECT bio, certifications, experience_years, specializations, 
                hourly_rate, availability_schedule, is_approved, rating, total_sessions
         FROM therapist_profiles WHERE user_id = ?`,
        [req.user.id]
      );

      if (therapistProfiles.length > 0) {
        user.therapistProfile = {
          ...therapistProfiles[0],
          specializations: JSON.parse(therapistProfiles[0].specializations || '[]'),
          availability_schedule: JSON.parse(therapistProfiles[0].availability_schedule || '{}')
        };
      }
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
  body('address').optional().trim()
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

    const { firstName, lastName, phone, dateOfBirth, address } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(dateOfBirth);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(req.user.id);

    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Upload profile image
router.post('/profile/image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    await executeQuery(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl
      }
    });

  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
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

    const { currentPassword, newPassword } = req.body;

    // Get current password
    const users = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get user appointments
router.get('/appointments', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE (a.client_id = ? OR a.therapist_id = ?)';
    let queryParams = [req.user.id, req.user.id];

    if (status) {
      whereClause += ' AND a.status = ?';
      queryParams.push(status);
    }

    const appointments = await executeQuery(
      `SELECT a.*, 
              client.first_name as client_first_name, client.last_name as client_last_name,
              therapist.first_name as therapist_first_name, therapist.last_name as therapist_last_name,
              tp.hourly_rate
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users therapist ON a.therapist_id = therapist.id
       LEFT JOIN therapist_profiles tp ON therapist.id = tp.user_id
       ${whereClause}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    const totalQuery = await executeQuery(
      `SELECT COUNT(*) as total
       FROM appointments a
       ${whereClause}`,
      queryParams
    );

    const total = totalQuery[0].total;

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
});

// Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await executeQuery(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    const totalQuery = await executeQuery(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [req.user.id]
    );

    const total = totalQuery[0].total;

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Delete user account
router.delete('/account', [
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password
    const users = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidPassword = await bcrypt.compare(password, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check for pending appointments
    const pendingAppointments = await executeQuery(
      'SELECT COUNT(*) as count FROM appointments WHERE (client_id = ? OR therapist_id = ?) AND status IN (?, ?)',
      [req.user.id, req.user.id, 'pending', 'confirmed']
    );

    if (pendingAppointments[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with pending or confirmed appointments'
      });
    }

    // Delete user account (CASCADE will handle related records)
    await executeQuery('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;
