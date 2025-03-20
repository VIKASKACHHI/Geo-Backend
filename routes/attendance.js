import express from 'express';
import Attendance from '../models/Attendance.js'; // ✅ Fixed import
import OfficeLocation from '../models/OfficeLocation.js'; // ✅ Fixed import
import { verifyToken } from './auth.js';
import { isWithinRadius } from '../utils/geoUtils.js';


const router = express.Router();


/**
 * @route   POST /api/attendance/check-in
 * @desc    Employee check-in with location verification
 * @access  Private
 */
router.post('/check-in', verifyToken, async (req, res) => {
    try {
        const { officeLocationId, longitude, latitude } = req.body;

        if (!officeLocationId || !longitude || !latitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const officeLocation = await OfficeLocation.findById(officeLocationId);
        if (!officeLocation || !officeLocation.isActive) {
            return res.status(404).json({ message: 'Invalid or inactive office location' });
        }

        const user = await User.findOne({ uid: req.user.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            user: user._id,
            status: 'checked-in',
            date: { $gte: today }
        });

        if (existingAttendance) {
            return res.status(400).json({ 
                message: 'Already checked in today',
                attendance: existingAttendance
            });
        }

        const userCoordinates = [parseFloat(longitude), parseFloat(latitude)];
        const officeCoordinates = officeLocation.location.coordinates;

        if (!isWithinRadius(userCoordinates, officeCoordinates, officeLocation.radius)) {
            return res.status(400).json({ message: 'Outside allowed radius' });
        }

        const newAttendance = new Attendance({
            user: user._id,
            officeLocation: officeLocation._id,
            checkInTime: new Date(),
            checkInLocation: { type: 'Point', coordinates: userCoordinates },
            status: 'checked-in',
            date: new Date()
        });

        const savedAttendance = await newAttendance.save();
        res.status(201).json({ message: 'Check-in successful', attendance: savedAttendance });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/attendance/check-out
 * @desc    Employee check-out
 * @access  Private
 */
router.post('/check-out', verifyToken, async (req, res) => {
    try {
        const { attendanceId, longitude, latitude, notes } = req.body;

        if (!attendanceId || !longitude || !latitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await User.findOne({ uid: req.user.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

        if (attendance.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        if (attendance.status === 'checked-out') {
            return res.status(400).json({ message: 'Already checked out' });
        }

        attendance.checkOutTime = new Date();
        attendance.checkOutLocation = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        attendance.status = 'checked-out';
        if (notes) attendance.notes = notes;

        const updatedAttendance = await attendance.save();
        res.json({ message: 'Check-out successful', attendance: updatedAttendance });

    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/attendance/history/:userId
 * @desc    Get attendance history
 * @access  Private (Admin, Manager, or Self)
 */
router.get('/history/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const currentUser = await User.findOne({ uid: req.user.uid });
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

        const isSelf = currentUser._id.toString() === targetUser._id.toString();
        const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);

        if (!isSelf && !isAdminOrManager) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const query = { user: targetUser._id };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendanceRecords = await Attendance.find(query)
            .populate('officeLocation', 'name address')
            .sort({ date: -1 });

        res.json(attendanceRecords);

    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/attendance/daily-report
 * @desc    Get daily attendance report
 * @access  Private (Admin/Manager)
 */
router.get('/daily-report', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!['admin', 'manager'].includes(user.role)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const reportDate = req.query.date ? new Date(req.query.date) : new Date();
        reportDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(reportDate);
        nextDay.setDate(reportDate.getDate() + 1);

        const attendanceRecords = await Attendance.find({
            date: { $gte: reportDate, $lt: nextDay }
        }).populate('user', 'displayName email employeeId department')
            .populate('officeLocation', 'name address');

        const allUsers = await User.find({ role: 'employee' });
        const checkedInUsers = new Set(attendanceRecords.map(record => record.user._id.toString()));
        const absentUsers = allUsers.filter(user => !checkedInUsers.has(user._id.toString()));

        const report = {
            date: reportDate,
            totalEmployees: allUsers.length,
            presentCount: checkedInUsers.size,
            absentCount: absentUsers.length,
            presentPercentage: (checkedInUsers.size / allUsers.length) * 100,
            attendanceRecords,
            absentUsers
        };

        res.json(report);

    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;