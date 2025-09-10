const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students - ดึงข้อมูลนักเรียนทั้งหมด
router.get('/', async (req, res) => {
    try {
        console.log('📖 Getting all students...');
        const students = await Student.getAll();
        
        res.json({
            success: true,
            message: 'Students retrieved successfully',
            data: students,
            count: students.length
        });
    } catch (error) {
        console.error('❌ Error getting students:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get students',
            error: error.message
        });
    }
});

// GET /api/students/:id - ดึงข้อมูลนักเรียนตาม ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📖 Getting student with ID: ${id}`);
        
        const student = await Student.getById(parseInt(id));
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Student retrieved successfully',
            data: student
        });
    } catch (error) {
        console.error('❌ Error getting student:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get student',
            error: error.message
        });
    }
});

// POST /api/students - เพิ่มนักเรียนใหม่
router.post('/', async (req, res) => {
    try {
        const studentData = req.body;
        console.log('📝 Creating new student:', studentData);
        
        const newStudent = await Student.create(studentData);
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent
        });
    } catch (error) {
        console.error('❌ Error creating student:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create student',
            error: error.message
        });
    }
});

// PUT /api/students/:id - อัพเดทนักเรียน
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const studentData = req.body;
        console.log(`✏️ Updating student ID: ${id}`, studentData);
        
        const updatedStudent = await Student.update(parseInt(id), studentData);
        
        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: `Student not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        console.error('❌ Error updating student:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update student',
            error: error.message
        });
    }
});

// DELETE /api/students/:id - ลบนักเรียน
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting student ID: ${id}`);
        
        const deleted = await Student.delete(parseInt(id));
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: `Student not found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting student:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete student',
            error: error.message
        });
    }
});

module.exports = router;