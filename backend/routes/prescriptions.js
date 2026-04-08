// ============================================================
// Prescription Routes - Digital Prescription Management
// ============================================================

const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const InventoryLog = require('../models/InventoryLog');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// -----------------------------------------------------------
// POST /api/prescriptions - Create prescription (Doctors only)
// -----------------------------------------------------------
router.post('/', authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { patient, diagnosis, medications, notes, followUpDate, appointment } = req.body;

    const prescription = await Prescription.create({
      patient,
      doctor: req.user.id,
      appointment: appointment || null,
      diagnosis,
      medications,
      notes: notes || '',
      followUpDate: followUpDate || null
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'name email universityId')
      .populate('doctor', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Prescription issued successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/prescriptions - Get prescriptions (role-filtered)
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email universityId')
      .populate('doctor', 'name email department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: prescriptions,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/prescriptions/:id - Get single prescription
// -----------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email universityId department bloodGroup')
      .populate('doctor', 'name email department')
      .populate('medications.medicine', 'name category stock');

    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/prescriptions/:id/dispense - Dispense (Pharmacist)
// -----------------------------------------------------------
router.put('/:id/dispense', authorize('pharmacist', 'admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    if (prescription.isDispensed) {
      return res.status(400).json({ success: false, error: 'Prescription already dispensed' });
    }

    // Process each medication stock deduction
    for (const item of prescription.medications) {
      if (item.medicine) {
        const medicine = await Medicine.findById(item.medicine);
        if (medicine) {
          // Attempt to extract quantity from dosage/duration (fallback to 1 if parsing fails)
          let deductQty = 1;
          const match = item.dosage.match(/\d+/);
          if (match) {
             deductQty = parseInt(match[0]);
          }
          
          const prevStock = medicine.stock;
          medicine.stock = Math.max(0, medicine.stock - deductQty);
          await medicine.save();

          await InventoryLog.create({
            medicine: medicine._id,
            action: 'Dispensed',
            previousStock: prevStock,
            newStock: medicine.stock,
            changeQuantity: -deductQty,
            performedBy: req.user.id,
            reason: `Dispensed for Prescription ID: ${prescription._id}`
          });
        }
      }
    }

    prescription.isDispensed = true;
    prescription.dispensedBy = req.user.id;
    prescription.dispensedAt = new Date();
    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'name email universityId')
      .populate('doctor', 'name email');

    res.json({
      success: true,
      message: 'Prescription dispensed and inventory updated',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
