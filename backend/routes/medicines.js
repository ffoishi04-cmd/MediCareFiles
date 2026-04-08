// ============================================================
// Medicine Routes - Pharmacy Inventory CRUD
// ============================================================

const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const InventoryLog = require('../models/InventoryLog');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// -----------------------------------------------------------
// POST /api/medicines - Add new medicine (Pharmacist/Admin)
// -----------------------------------------------------------
router.post('/', authorize('pharmacist', 'admin'), async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    
    // Log initial stock
    await InventoryLog.create({
      medicine: medicine._id,
      action: 'Added',
      previousStock: 0,
      newStock: medicine.stock,
      changeQuantity: medicine.stock,
      performedBy: req.user.id,
      reason: 'Initial inventory entry'
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory',
      data: medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/medicines - Get all medicines (with search & filter)
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const medicines = await Medicine.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Medicine.countDocuments(query);

    res.json({
      success: true,
      data: medicines,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/medicines/:id - Update medicine (Pharmacist/Admin)
// -----------------------------------------------------------
router.put('/:id', authorize('pharmacist', 'admin'), async (req, res) => {
  try {
    const oldMedicine = await Medicine.findById(req.params.id);
    if (!oldMedicine) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If stock changed, log it
    if (req.body.stock !== undefined && req.body.stock !== oldMedicine.stock) {
      await InventoryLog.create({
        medicine: medicine._id,
        action: 'Stock Adjusted',
        previousStock: oldMedicine.stock,
        newStock: medicine.stock,
        changeQuantity: medicine.stock - oldMedicine.stock,
        performedBy: req.user.id,
        reason: req.body.reason || 'Manual stock update'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// DELETE /api/medicines/:id - Remove medicine (Admin only)
// -----------------------------------------------------------
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, message: 'Medicine removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/medicines/stats/inventory - Inventory statistics
// -----------------------------------------------------------
router.get('/stats/inventory', authorize('pharmacist', 'admin'), async (req, res) => {
  try {
    const [total, lowStock, critical, expiringSoon] = await Promise.all([
      Medicine.countDocuments(),
      Medicine.countDocuments({ status: 'Low Stock' }),
      Medicine.countDocuments({ status: 'Critical' }),
      Medicine.countDocuments({
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
    ]);

    const totalStock = await Medicine.aggregate([
      { $group: { _id: null, totalUnits: { $sum: '$stock' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalMedicines: total,
        totalUnits: totalStock[0]?.totalUnits || 0,
        lowStock,
        critical,
        expiringSoon
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
