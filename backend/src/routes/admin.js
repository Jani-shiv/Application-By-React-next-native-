const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply admin role requirement to all routes
router.use(requireRole(['admin']));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['client']
    );

    // Get total therapists
    const totalTherapists = await executeQuery(
      'SELECT COUNT(*) as count FROM therapist_profiles WHERE is_approved = TRUE'
    );

    // Get pending therapist applications
    const pendingTherapists = await executeQuery(
      'SELECT COUNT(*) as count FROM therapist_profiles WHERE is_approved = FALSE'
    );

    // Get total appointments
    const totalAppointments = await executeQuery(
      'SELECT COUNT(*) as count FROM appointments'
    );

    // Get revenue this month
    const monthlyRevenue = await executeQuery(
      `SELECT COALESCE(SUM(price), 0) as revenue 
       FROM appointments 
       WHERE status = 'completed' 
       AND YEAR(appointment_date) = YEAR(CURRENT_DATE()) 
       AND MONTH(appointment_date) = MONTH(CURRENT_DATE())`
    );

    // Get recent appointments
    const recentAppointments = await executeQuery(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status,
              client.first_name as client_name, client.last_name as client_last_name,
              therapist.first_name as therapist_name, therapist.last_name as therapist_last_name
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users therapist ON a.therapist_id = therapist.id
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers[0].count,
          totalTherapists: totalTherapists[0].count,
          pendingTherapists: pendingTherapists[0].count,
          totalAppointments: totalAppointments[0].count,
          monthlyRevenue: monthlyRevenue[0].revenue || 0
        },
        recentAppointments
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (role) {
      whereClause += ' AND role = ?';
      queryParams.push(role);
    }

    const users = await executeQuery(
      `SELECT id, email, first_name, last_name, phone, role, is_verified, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    const totalQuery = await executeQuery(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );

    const total = totalQuery[0].total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// Get therapist applications
router.get('/therapist-applications', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const offset = (page - 1) * limit;

    const isApproved = status === 'approved' ? true : false;

    const applications = await executeQuery(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
              tp.bio, tp.certifications, tp.experience_years, tp.specializations,
              tp.hourly_rate, tp.is_approved, tp.created_at as application_date
       FROM users u
       JOIN therapist_profiles tp ON u.id = tp.user_id
       WHERE tp.is_approved = ?
       ORDER BY tp.created_at DESC
       LIMIT ? OFFSET ?`,
      [isApproved, parseInt(limit), parseInt(offset)]
    );

    const totalQuery = await executeQuery(
      'SELECT COUNT(*) as total FROM therapist_profiles WHERE is_approved = ?',
      [isApproved]
    );

    const total = totalQuery[0].total;

    // Parse JSON fields
    const formattedApplications = applications.map(app => ({
      ...app,
      specializations: JSON.parse(app.specializations || '[]')
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get therapist applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get therapist applications'
    });
  }
});

// Approve/reject therapist application
router.put('/therapist-applications/:id', [
  body('action').isIn(['approve', 'reject']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const therapists = await executeQuery(
      'SELECT user_id FROM therapist_profiles WHERE user_id = ?',
      [id]
    );

    if (therapists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Therapist application not found'
      });
    }

    const isApproved = action === 'approve';

    await executeQuery(
      'UPDATE therapist_profiles SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [isApproved, id]
    );

    // Create notification for therapist
    const notificationTitle = isApproved ? 'Application Approved' : 'Application Rejected';
    const notificationMessage = isApproved 
      ? 'Congratulations! Your therapist application has been approved. You can now receive bookings.'
      : `Your therapist application has been rejected. ${notes || 'Please contact support for more information.'}`;

    await executeQuery(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [id, notificationTitle, notificationMessage, 'system']
    );

    res.json({
      success: true,
      message: `Therapist application ${action}d successfully`
    });

  } catch (error) {
    console.error('Update therapist application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update therapist application'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const users = await executeQuery(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (users[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Check for pending appointments
    const pendingAppointments = await executeQuery(
      'SELECT COUNT(*) as count FROM appointments WHERE (client_id = ? OR therapist_id = ?) AND status IN (?, ?)',
      [id, id, 'pending', 'confirmed']
    );

    if (pendingAppointments[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with pending or confirmed appointments'
      });
    }

    // Delete user (CASCADE will handle related records)
    await executeQuery('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, therapist_id, client_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (status) {
      whereClause += ' AND a.status = ?';
      queryParams.push(status);
    }

    if (therapist_id) {
      whereClause += ' AND a.therapist_id = ?';
      queryParams.push(therapist_id);
    }

    if (client_id) {
      whereClause += ' AND a.client_id = ?';
      queryParams.push(client_id);
    }

    const appointments = await executeQuery(
      `SELECT a.*, 
              client.first_name as client_first_name, client.last_name as client_last_name,
              therapist.first_name as therapist_first_name, therapist.last_name as therapist_last_name
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users therapist ON a.therapist_id = therapist.id
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
    console.error('Get admin appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
});

module.exports = router;
