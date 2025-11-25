const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getBorrowHistory,
  getAllBorrowings
} = require('../controllers/borrowingController');
const { authenticate, authorize } = require('../middleware/auth');
const { borrowBookValidation } = require('../middleware/validation');

router.post('/borrow', authenticate, authorize('Member', 'Admin'), borrowBookValidation, borrowBook);
router.put('/return/:borrowingId', authenticate, authorize('Member', 'Admin'), returnBook);
router.get('/history', authenticate, authorize('Member', 'Admin'), getBorrowHistory);
router.get('/all', authenticate, authorize('Admin'), getAllBorrowings);

module.exports = router;
