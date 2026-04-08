// ============================================================
// Database Seed Script - Populate MongoDB with Sample Data
// Run: node seed.js
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Medicine = require('./models/Medicine');
const Ambulance = require('./models/Ambulance');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n  [SEED] Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Medicine.deleteMany({}),
      Ambulance.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({})
    ]);
    console.log('  [SEED] Cleared existing data');

    // -----------------------------------------------------------
    // Create Users
    // -----------------------------------------------------------
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@medicare.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medicare.edu',
        password: 'doctor123',
        role: 'doctor',
        department: 'General Medicine',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@medicare.edu',
        password: 'doctor123',
        role: 'doctor',
        department: 'Dermatology',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Sarah Martinez',
        email: 'sarah.martinez@medicare.edu',
        password: 'pharma123',
        role: 'pharmacist',
        department: 'Pharmacy',
        isApproved: true,
        isActive: true
      },
      {
        name: 'K. M. Shafayat Shapnil',
        email: 'shapnil@medicare.edu',
        password: 'student123',
        role: 'student',
        universityId: '08123202051001',
        department: 'Computer Science',
        bloodGroup: 'O+',
        phone: '+1 234-567-8900',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@medicare.edu',
        password: 'student123',
        role: 'student',
        universityId: 'STU-2024-2156',
        department: 'Engineering',
        bloodGroup: 'A+',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@medicare.edu',
        password: 'student123',
        role: 'student',
        universityId: 'STU-2024-3421',
        department: 'Business',
        bloodGroup: 'B+',
        isApproved: true,
        isActive: true
      }
    ]);

    console.log(`  [SEED] Created ${users.length} users`);

    const admin = users[0];
    const drJohnson = users[1];
    const drChen = users[2];
    const pharmacist = users[3];
    const studentShapnil = users[4];
    const studentEmma = users[5];
    const studentMichael = users[6];

    // -----------------------------------------------------------
    // Create Student Profiles
    // -----------------------------------------------------------
    await Student.create([
      {
        userId: studentShapnil._id,
        studentId: '08123202051001',
        name: 'K. M. Shafayat Shapnil',
        department: 'Computer Science',
        batch: '18th',
        bloodGroup: 'O+',
        phone: '+1 234-567-8900',
        emergencyContact: { name: 'Parent', phone: '+1 234-567-9999', relation: 'Father' }
      },
      {
        userId: studentEmma._id,
        studentId: 'STU-2024-2156',
        name: 'Emma Wilson',
        department: 'Engineering',
        batch: '18th',
        bloodGroup: 'A+',
        phone: '+1 234-567-8901'
      },
      {
        userId: studentMichael._id,
        studentId: 'STU-2024-3421',
        name: 'Michael Brown',
        department: 'Business',
        batch: '19th',
        bloodGroup: 'B+',
        phone: '+1 234-567-8902'
      }
    ]);

    console.log('  [SEED] Created student profiles');

    // -----------------------------------------------------------
    // Create Medicines
    // -----------------------------------------------------------
    await Medicine.create([
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', stock: 450, reorderLevel: 200, expiryDate: '2026-12-15', manufacturer: 'PharmaCo', batchNumber: 'BN-001', dosageForm: 'Capsule', strength: '500mg' },
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Pain Relief', stock: 890, reorderLevel: 300, expiryDate: '2027-03-20', manufacturer: 'MediCorp', batchNumber: 'BN-002', dosageForm: 'Tablet', strength: '500mg' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Anti-inflammatory', stock: 150, reorderLevel: 200, expiryDate: '2026-08-10', manufacturer: 'PharmaCo', batchNumber: 'BN-003', dosageForm: 'Tablet', strength: '400mg' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', stock: 320, reorderLevel: 150, expiryDate: '2026-05-30', manufacturer: 'AllergyMed', batchNumber: 'BN-004', dosageForm: 'Tablet', strength: '10mg' },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', stock: 80, reorderLevel: 100, expiryDate: '2026-03-15', manufacturer: 'GastroMed', batchNumber: 'BN-005', dosageForm: 'Capsule', strength: '20mg' },
      { name: 'Azithromycin 250mg', genericName: 'Azithromycin', category: 'Antibiotic', stock: 45, reorderLevel: 100, expiryDate: '2026-02-28', manufacturer: 'PharmaCo', batchNumber: 'BN-006', dosageForm: 'Tablet', strength: '250mg' }
    ]);

    console.log('  [SEED] Created medicines');

    // -----------------------------------------------------------
    // Create Ambulances
    // -----------------------------------------------------------
    await Ambulance.create([
      { vehicleId: 'AMB-001', status: 'Available', driver: { name: 'Michael Johnson', contact: '+1 234-567-8901' }, currentLocation: 'Main Campus', lastServiceDate: '2026-01-15' },
      { vehicleId: 'AMB-002', status: 'On Mission', driver: { name: 'Sarah Williams', contact: '+1 234-567-8902' }, currentLocation: 'En route to Engineering Block', lastServiceDate: '2026-01-20', currentMission: { patient: 'Emma Wilson', studentId: 'STU-2024-2156', pickup: 'Engineering Block', emergencyType: 'Ankle Injury', priority: 'Medium', dispatchedAt: new Date() } },
      { vehicleId: 'AMB-003', status: 'Available', driver: { name: 'Robert Brown', contact: '+1 234-567-8903' }, currentLocation: 'Medical Center Parking', lastServiceDate: '2026-02-01' },
      { vehicleId: 'AMB-004', status: 'Maintenance', driver: { name: 'N/A', contact: 'N/A' }, currentLocation: 'Service Center', lastServiceDate: '2026-02-08' }
    ]);

    console.log('  [SEED] Created ambulances');

    // -----------------------------------------------------------
    // Create Appointments
    // -----------------------------------------------------------
    const appointments = await Appointment.create([
      { patient: studentShapnil._id, doctor: drJohnson._id, date: '2026-02-10', time: '10:00 AM', status: 'Confirmed', symptoms: 'Fever, Headache' },
      { patient: studentShapnil._id, doctor: drChen._id, date: '2026-02-15', time: '2:30 PM', status: 'Scheduled', symptoms: 'Skin rash' },
      { patient: studentEmma._id, doctor: drJohnson._id, date: '2026-02-09', time: '11:00 AM', status: 'In Progress', symptoms: 'Sore throat, Cough' },
      { patient: studentMichael._id, doctor: drJohnson._id, date: '2026-02-09', time: '2:00 PM', status: 'Scheduled', symptoms: 'Back pain' }
    ]);

    console.log(`  [SEED] Created ${appointments.length} appointments`);

    // -----------------------------------------------------------
    // Create Prescriptions
    // -----------------------------------------------------------
    await Prescription.create([
      {
        patient: studentShapnil._id,
        doctor: drJohnson._id,
        appointment: appointments[0]._id,
        diagnosis: 'Viral Infection',
        medications: [
          { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: '3 times daily', duration: '7 days', instructions: 'Take after meals' },
          { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'As needed', duration: '14 days', instructions: 'Take for fever above 100F' }
        ],
        status: 'Active',
        isDispensed: true,
        dispensedBy: pharmacist._id,
        dispensedAt: new Date()
      },
      {
        patient: studentEmma._id,
        doctor: drChen._id,
        diagnosis: 'Allergic Reaction',
        medications: [
          { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '14 days', instructions: 'Take at bedtime' }
        ],
        status: 'Active'
      }
    ]);

    console.log('  [SEED] Created prescriptions');

    // -----------------------------------------------------------
    // Done
    // -----------------------------------------------------------
    console.log('\n  =============================================');
    console.log('   DATABASE SEEDED SUCCESSFULLY');
    console.log('  =============================================');
    console.log('\n  Sample Login Credentials:');
    console.log('  ─────────────────────────────────────────');
    console.log('  Admin:      admin@medicare.edu / admin123');
    console.log('  Doctor:     sarah.johnson@medicare.edu / doctor123');
    console.log('  Pharmacist: sarah.martinez@medicare.edu / pharma123');
    console.log('  Student:    shapnil@medicare.edu / student123');
    console.log('  ─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('  [SEED ERROR]', error.message);
    process.exit(1);
  }
};

seedDatabase();
