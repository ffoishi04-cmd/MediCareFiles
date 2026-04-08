// ============================================================
// Medicine Model - Pharmacy Inventory Management
// ============================================================

const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Antibiotic', 'Pain Relief', 'Anti-inflammatory', 'Antihistamine',
      'Antacid', 'Antifungal', 'Vitamin', 'Antiseptic', 'Cardiovascular',
      'Respiratory', 'Dermatological', 'Other'
    ]
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 100
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  manufacturer: {
    type: String,
    default: ''
  },
  batchNumber: {
    type: String,
    default: ''
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'],
    default: 'Tablet'
  },
  strength: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Critical', 'Out of Stock', 'Expired'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

// Auto-calculate status before saving
MedicineSchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.status = 'Out of Stock';
  } else if (this.stock < this.reorderLevel * 0.25) {
    this.status = 'Critical';
  } else if (this.stock < this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }

  if (new Date(this.expiryDate) < new Date()) {
    this.status = 'Expired';
  }

  next();
});

MedicineSchema.index({ name: 'text', genericName: 'text' });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ status: 1 });

module.exports = mongoose.model('Medicine', MedicineSchema);
