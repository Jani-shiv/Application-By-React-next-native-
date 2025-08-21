const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all therapists (public endpoint with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      specialization, 
      minRating, 
      maxRate, 
      sortBy = 'rating' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE tp.is_approved = TRUE';
    let queryParams = [];
    
    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR tp.bio LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (specialization) {
      whereClause += ' AND JSON_CONTAINS(tp.specializations, ?)';
      queryParams.push(JSON.stringify(specialization));
    }
    
    if (minRating) {
      whereClause += ' AND tp.rating >= ?';
      queryParams.push(parseFloat(minRating));
    }
    
    if (maxRate) {
      whereClause += ' AND tp.hourly_rate <= ?';
      queryParams.push(parseFloat(maxRate));
    }
    
    let orderClause = 'ORDER BY ';
    switch (sortBy) {
      case 'rating':
        orderClause += 'tp.rating DESC, tp.total_sessions DESC';
        break;
      case 'price_low':
        orderClause += 'tp.hourly_rate ASC';
        break;
      case 'price_high':
        orderClause += 'tp.hourly_rate DESC';
        break;
      case 'experience':
        orderClause += 'tp.experience_years DESC';
        break;
      default:
        orderClause += 'tp.rating DESC';
    }
    
    const therapists = await executeQuery(
      `SELECT u.id, u.first_name, u.last_name, u.profile_image,
              tp.bio, tp.certifications, tp.experience_years, 
              tp.specializations, tp.hourly_rate, tp.rating, tp.total_sessions
       FROM users u
       JOIN therapist_profiles tp ON u.id = tp.user_id
       ${whereClause}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );
    
    // Parse JSON fields
    const formattedTherapists = therapists.map(therapist => ({
      ...therapist,
      specializations: JSON.parse(therapist.specializations || '[]')
    }));
    
    // Get total count
    const totalQuery = await executeQuery(
      `SELECT COUNT(*) as total
       FROM users u
       JOIN therapist_profiles tp ON u.id = tp.user_id
       ${whereClause}`,
      queryParams
    );
    
    const total = totalQuery[0].total;
    
    res.json({
      success: true,
      data: {
        therapists: formattedTherapists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get therapists'
    });
  }
});

// Get therapist by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapists = await executeQuery(
      `SELECT u.id, u.first_name, u.last_name, u.profile_image, u.email,
              tp.bio, tp.certifications, tp.experience_years, 
              tp.specializations, tp.hourly_rate, tp.availability_schedule,
              tp.rating, tp.total_sessions, tp.created_at
       FROM users u
       JOIN therapist_profiles tp ON u.id = tp.user_id
       WHERE u.id = ? AND tp.is_approved = TRUE`,
      [id]
    );
    
    if (therapists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }
    
    const therapist = {
      ...therapists[0],
      specializations: JSON.parse(therapists[0].specializations || '[]'),
      availability_schedule: JSON.parse(therapists[0].availability_schedule || '{}')
    };
    
    // Get recent reviews
    const reviews = await executeQuery(
      `SELECT r.rating, r.comment, r.created_at,
              u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.therapist_id = ? AND r.is_public = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );
    
    therapist.reviews = reviews;
    
    res.json({
      success: true,
      data: therapist
    });
    
  } catch (error) {
    console.error('Get therapist by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get therapist details'
    });
  }
});

// Get therapist availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    // Get therapist's availability schedule
    const therapists = await executeQuery(
      'SELECT availability_schedule FROM therapist_profiles WHERE user_id = ? AND is_approved = TRUE',
      [id]
    );
    
    if (therapists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }
    
    const availabilitySchedule = JSON.parse(therapists[0].availability_schedule || '{}');
    
    // If specific date requested, get available slots for that date
    if (date) {
      const dayOfWeek = new Date(date).toLocaleLowerCase();
      const daySchedule = availabilitySchedule[dayOfWeek] || [];
      
      // Get existing appointments for that date
      const appointments = await executeQuery(
        'SELECT appointment_time, duration FROM appointments WHERE therapist_id = ? AND appointment_date = ? AND status IN (?, ?)',
        [id, date, 'confirmed', 'pending']
      );
      
      // Filter out booked slots
      const bookedSlots = appointments.map(apt => ({
        start: apt.appointment_time,
        duration: apt.duration
      }));
      
      // Calculate available slots (this is a simplified version)
      const availableSlots = daySchedule.filter(slot => {
        return !bookedSlots.some(booked => {
          // Simple overlap check - in production, implement proper time slot logic
          return slot.start === booked.start;
        });
      });
      
      res.json({
        success: true,
        data: {
          date,
          availableSlots
        }
      });
    } else {
      // Return full schedule
      res.json({
        success: true,
        data: {
          schedule: availabilitySchedule
        }
      });
    }
    
  } catch (error) {
    console.error('Get therapist availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability'
    });
  }
});

// Update therapist profile (therapist only)
router.put('/profile', async (req, res) => {
  try {
    // This would include auth middleware for therapists only
    // Implementation would be similar to users profile update
    // but for therapist-specific fields
    
    res.json({
      success: false,
      message: 'Endpoint under development'
    });
    
  } catch (error) {
    console.error('Update therapist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update therapist profile'
    });
  }
});

module.exports = router;
