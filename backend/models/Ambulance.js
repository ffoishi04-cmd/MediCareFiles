// ============================================================
// Ambulance Model - Emergency Dispatch Management
// ============================================================

const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['Available', 'On Mission', 'Maintenance', 'Out of Service'],
    default: 'Available'
  },
  driver: {
    name: { type: String, default: 'N/A' },
    contact: { type: String, default: 'N/A' },
    licenseNumber: { type: String, default: '' }
  },
  currentLocation: {
    type: String,
    default: 'Medical Center Parking'
  },
  lastServiceDate: {
    type: Date,
    default: Date.now
  },
  currentMission: {
    patient: { type: String, default: '' },
    studentId: { type: String, default: '' },
    pickup: { type: String, default: '' },
    destination: { type: String, default: 'Medical Center' },
    emergencyType: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', ''],
      default: ''
    },
    dispatchedAt: { type: Date, default: null }
  },
  equipmentChecked: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ambulance', AmbulanceSchema);
