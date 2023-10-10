const express = require('express');
const studentController = require('../controllers/student.controller');
const {
  addStudentValidation,
  editStudentValidation,
} = require('../validations/student.validation');
const router = express.Router();

router.get('/add-student', studentController.getAddStudent);
router.post(
  '/add-student',
  addStudentValidation,
  studentController.postAddStudent
);
router.get('/view-students/:level', studentController.getManageStudent);
router.post('/delete-student', studentController.deleteStudent);
router.get('/edit-student/:studentId', studentController.getEditStudent);
router.post(
  '/edit-student',
  editStudentValidation,
  studentController.postEditStudent
);
router.post('/get-student', studentController.getStudentById);
router.post('/search-student', studentController.studentSearch);
router.post('/student-balance', studentController.editStudentBalance)
module.exports = router;
