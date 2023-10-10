const express = require('express');
const attendanceController = require('../controllers/attendance.controllers');
const router = express.Router();

router.get('/take-attendance', attendanceController.getTakeAttendance);
router.post('/take-attendance', attendanceController.postTakeAttendance);
router.get('/view-attendance', attendanceController.getViewAttendance);
router.post('/get-group-attendance', attendanceController.getGroupAttendance);
router.get(
  '/attendance-student/:id',
  attendanceController.getAttendanceStudent
);
router.post('/student-attendance', attendanceController.getStudentAttendance);
module.exports = router;
