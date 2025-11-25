const { body, param } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['Admin', 'Member']).withMessage('Role must be either Admin or Member')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const addBookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Book title is required'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author name is required'),
  body('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required'),
  body('publicationDate')
    .notEmpty().withMessage('Publication date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  body('genre')
    .trim()
    .notEmpty().withMessage('Genre is required'),
  body('totalCopies')
    .notEmpty().withMessage('Number of copies is required')
    .isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer')
];

const borrowBookValidation = [
  body('bookId')
    .notEmpty().withMessage('Book ID is required')
    .isMongoId().withMessage('Invalid book ID')
];

const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  registerValidation,
  loginValidation,
  addBookValidation,
  borrowBookValidation,
  mongoIdValidation
};
