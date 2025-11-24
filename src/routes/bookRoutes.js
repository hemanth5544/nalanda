const express = require('express');
const router = express.Router();
const {
  addBook,
  updateBook,
  deleteBook,
  listBooks,
  getBook
} = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');
const { addBookValidation, mongoIdValidation } = require('../middleware/validation');

router.post('/', authenticate, authorize('Admin'), addBookValidation, addBook);
router.put('/:id', authenticate, authorize('Admin'), mongoIdValidation, updateBook);
router.delete('/:id', authenticate, authorize('Admin'), mongoIdValidation, deleteBook);
router.get('/', authenticate, listBooks);
router.get('/:id', authenticate, mongoIdValidation, getBook);

module.exports = router;
