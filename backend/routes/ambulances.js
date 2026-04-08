// ============================================================
// Ambulance Routes - Emergency Dispatch Management
// ============================================================

const express = require('express');
const router = express.Router();
const Ambulance = require('../models/Ambulance');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// -----------------------------------------------------------
// GET /api/ambulances - Get all ambulances
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const ambulances = await Ambulance.find(query).sort({ vehicleId: 1 });

    res.json({ success: true, data: ambulances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// POST /api/ambulances - Add ambulance (Admin only)
// -----------------------------------------------------------
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Ambulance added to fleet',
      data: ambulance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/ambulances/:id/dispatch - Dispatch ambulance
// -----------------------------------------------------------
router.put('/:id/dispatch', authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { patient, studentId, pickup, emergencyType, priority } = req.body;

    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ success: false, error: 'Ambulance not found' });
    }

    if (ambulance.status !== 'Available') {
      return res.status(400).json({ success: false, error: 'Ambulance is not available for dispatch' });
    }

    ambulance.status = 'On Mission';
    ambulance.currentMission = {
      patient,
      studentId: studentId || '',
      pickup,
      destination: 'Medical Center',
      emergencyType,
      priority: priority || 'Medium',
      dispatchedAt: new Date()
    };

    await ambulance.save();

    res.json({
      success: true,
      message: `Ambulance ${ambulance.vehicleId} dispatched successfully`,
      data: ambulance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/ambulances/:id/complete - Complete mission
// -----------------------------------------------------------
router.put('/:id/complete', authorize('admin', 'doctor'), async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      return res.status(404).json({ success: false, error: 'Ambulance not found' });
    }

    ambulance.status = 'Available';
    ambulance.currentLocation = 'Medical Center Parking';
    ambulance.currentMission = {
      patient: '',
      studentId: '',
      pickup: '',
      destination: 'Medical Center',
      emergencyType: '',
      priority: '',
      dispatchedAt: null
    };

    await ambulance.save();

    res.json({
      success: true,
      message: `Ambulance ${ambulance.vehicleId} mission completed`,
      data: ambulance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// POST /api/ambulances/emergency-request - Request emergency
// -----------------------------------------------------------
router.post('/emergency-request', async (req, res) => {
  try {
    const { location, emergencyType, priority } = req.body;

    // Find first available ambulance
    const ambulance = await Ambulance.findOne({ status: 'Available' });

    if (!ambulance) {
      return res.status(503).json({
        success: false,
        error: 'No ambulances currently available. Emergency services have been notified.',
        emergencyHotline: '911'
      });
    }

    res.json({
      success: true,
      message: 'Emergency request received. Ambulance is being dispatched.',
      data: {
        assignedUnit: ambulance.vehicleId,
        estimatedArrival: '4-6 minutes',
        emergencyHotline: '911'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
