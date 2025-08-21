const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Book appointment
router.post('/', [
  body('therapist_id').isInt(),
  body('appointment_date').isISO8601(),
  body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration').isInt({ min: 30, max: 180 }),
  body('session_type').isIn(['in-person', 'remote']),
  body('notes').optional().trim()
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

    const { 
      therapist_id, 
      appointment_date, 
      appointment_time, 
      duration, 
      session_type, 
      notes 
    } = req.body;

    // Check if therapist exists and is approved
    const therapists = await executeQuery(
      'SELECT tp.hourly_rate FROM therapist_profiles tp WHERE tp.user_id = ? AND tp.is_approved = TRUE',
      [therapist_id]
    );

    if (therapists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found or not approved'
      });
    }

    // Check if time slot is available
    const conflictingAppointments = await executeQuery(
      `SELECT id FROM appointments 
       WHERE therapist_id = ? 
       AND appointment_date = ? 
       AND appointment_time = ?
       AND status IN ('pending', 'confirmed')`,
      [therapist_id, appointment_date, appointment_time]
    );

    if (conflictingAppointments.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    // Calculate price
    const hourlyRate = therapists[0].hourly_rate || 0;
    const price = (hourlyRate * duration) / 60;

    // Create appointment
    const result = await executeQuery(
      `INSERT INTO appointments 
       (client_id, therapist_id, appointment_date, appointment_time, duration, session_type, notes, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, therapist_id, appointment_date, appointment_time, duration, session_type, notes, price]
    );

    const appointmentId = result.insertId;

    // Get the created appointment with user details
    const appointments = await executeQuery(
      `SELECT a.*, 
              client.first_name as client_first_name, client.last_name as client_last_name,
              therapist.first_name as therapist_first_name, therapist.last_name as therapist_last_name
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users therapist ON a.therapist_id = therapist.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointments[0]
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointments = await executeQuery(
      `SELECT a.*, 
              client.first_name as client_first_name, client.last_name as client_last_name,
              client.email as client_email, client.phone as client_phone,
              therapist.first_name as therapist_first_name, therapist.last_name as therapist_last_name,
              therapist.email as therapist_email, therapist.phone as therapist_phone
       FROM appointments a
       JOIN users client ON a.client_id = client.id
       JOIN users therapist ON a.therapist_id = therapist.id
       WHERE a.id = ? AND (a.client_id = ? OR a.therapist_id = ?)`,
      [id, req.user.id, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointments[0]
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment'
    });
  }
});

// Update appointment
router.put('/:id', [
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  body('notes').optional().trim(),
  body('cancellation_reason').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellation_reason } = req.body;

    // Get appointment
    const appointments = await executeQuery(
      'SELECT * FROM appointments WHERE id = ? AND (client_id = ? OR therapist_id = ?)',
      [id, req.user.id, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check permissions for status updates
    if (status) {
      if (status === 'confirmed' && req.user.id !== appointment.therapist_id) {
        return res.status(403).json({
          success: false,
          message: 'Only therapists can confirm appointments'
        });
      }

      if (status === 'completed' && req.user.id !== appointment.therapist_id) {
        return res.status(403).json({
          success: false,
          message: 'Only therapists can mark appointments as completed'
        });
      }
    }

    // Update appointment
    const updateFields = [];
    const updateValues = [];

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (notes) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    if (cancellation_reason) {
      updateFields.push('cancellation_reason = ?');
      updateValues.push(cancellation_reason);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await executeQuery(
      `UPDATE appointments SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// Cancel appointment
router.delete('/:id', [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointments = await executeQuery(
      'SELECT * FROM appointments WHERE id = ? AND (client_id = ? OR therapist_id = ?)',
      [id, req.user.id, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Check if appointment can be cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    // Update appointment status to cancelled
    await executeQuery(
      'UPDATE appointments SET status = ?, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', reason || 'Cancelled by user', id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

module.exports = router;
