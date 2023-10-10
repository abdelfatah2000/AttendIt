const { body } = require('express-validator');


exports.addGroupValidation = [
  body('name')
    .isString()
    .isLength({ min: 6 })
    .trim()
    .withMessage('Please write a valid name'),
  body('level')
    .isString()
    .isIn(['First', 'Second', 'Third'])
    .withMessage('Please choose a valid level'),
  body('day')
    .isInt({ min: 1, max: 7})
    .withMessage('Please choose a valid day'),
];
