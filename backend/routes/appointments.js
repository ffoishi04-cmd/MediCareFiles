// ============================================================
// Appointment Routes - CRUD Operations
// ============================================================

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// -----------------------------------------------------------
// POST /api/appointments - Create appointment
// -----------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { patient, doctor, date, time, symptoms } = req.body;

    // Students can only create appointments for themselves.
    // Admins and Doctors can create appointments for any patient.
    let finalPatientId = req.user.id;
    if (req.user.role !== 'student' && patient) {
      finalPatientId = patient;
    }

    const appointment = await Appointment.create({
      patient: finalPatientId,
      doctor,
      date,
      time,
      symptoms: symptoms || ''
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email universityId')
      .populate('doctor', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/appointments - Get appointments (filtered by role)
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    // Admin and pharmacist can see all

    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email universityId department')
      .populate('doctor', 'name email department')
      .sort({ date: -1, time: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/appointments/:id - Get single appointment
// -----------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email universityId department bloodGroup')
      .populate('doctor', 'name email department');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/appointments/:id - Update appointment
// -----------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { status, diagnosis, notes, followUpDate } = req.body;
    
    // First find the appointment to check permissions
    const existingAppointment = await Appointment.findById(req.params.id);
    if (!existingAppointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Role check: Only admin or the assigned doctor can update diagnosis, notes, etc.
    // Patients can only cancel via DELETE route.
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Students cannot update appointments directly' });
    }
    if (req.user.role === 'doctor' && existingAppointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this appointment' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, diagnosis, notes, followUpDate },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email universityId')
      .populate('doctor', 'name email department');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// DELETE /api/appointments/:id - Cancel appointment
// -----------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Only allow cancellation by patient, assigned doctor, or admin
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/appointments/stats/overview - Get appointment stats
// -----------------------------------------------------------
router.get('/stats/overview', authorize('admin', 'doctor'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayCount, completed, pending] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: { $in: ['Scheduled', 'Confirmed'] } })
    ]);

    res.json({
      success: true,
      data: { total, todayCount, completed, pending }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
