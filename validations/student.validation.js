const { body, check } = require('express-validator');
const Student = require('../models/student.model');
exports.addStudentValidation = [
  body('name')
    .isString()
    .isLength({ min: 6 })
    .trim()
    .withMessage('Please write a valid name'),
  check('phone')
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Please write a valid phone number')
    .custom((value, { req }) => {
      return Student.findOne({ phone: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            'Phone exists already, please pick a different one.'
          );
        }
      });
    }),
  body('parent')
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Please write a valid phone number'),
  body('balance').isNumeric().withMessage('Please write a valid balance'),
  body('level')
    .isString()
    .isIn(['First', 'Second', 'Third'])
    .withMessage('Please choose a valid level'),
];

exports.editStudentValidation = [
  body('name')
    .isString()
    .isLength({ min: 6 })
    .trim()
    .withMessage('Please write a valid name'),
  check('phone')
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Please write a valid phone number')
    .custom((value, { req }) => {
      return Student.findOne({ phone: value }).then((userDoc) => {
        if (!(userDoc._id.toString() == req.body.studentId)) {
          return Promise.reject(
            'Phone exists already, please pick a different one.'
          );
        }
      });
    }),
  body('parent')
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Please write a valid phone number'),
  body('balance').isNumeric().withMessage('Please write a valid balance'),
  body('level')
    .isString()
    .isIn(['First', 'Second', 'Third'])
    .withMessage('Please choose a valid level'),
];
