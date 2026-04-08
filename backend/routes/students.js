// ============================================================
// Student Routes - Student Profile & Medical History
// ============================================================

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// -----------------------------------------------------------
// POST /api/students - Create student profile
// -----------------------------------------------------------
router.post('/', authorize('admin', 'student'), async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      userId: req.user.role === 'student' ? req.user.id : req.body.userId
    };

    const student = await Student.create(studentData);
    res.status(201).json({
      success: true,
      message: 'Student profile created',
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/students - Get all students (Doctor/Admin)
// -----------------------------------------------------------
router.get('/', authorize('doctor', 'admin', 'pharmacist'), async (req, res) => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/students/me - Get own student profile
// -----------------------------------------------------------
router.get('/me', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/students/:id - Get student by ID
// -----------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    // Role check: Students can only view their own profile
    if (req.user.role === 'student' && student.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this profile' });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/students/:id - Update student profile
// -----------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const existingStudent = await Student.findById(req.params.id);
    if (!existingStudent) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Role check: Students can only update their own profile, Admins can update any
    if (req.user.role === 'student' && existingStudent.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Student profile updated',
      data: student
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
