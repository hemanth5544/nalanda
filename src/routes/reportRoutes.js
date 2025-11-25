const express = require('express');
const router = express.Router();
const {
  getMostBorrowedBooks,
  getActiveMembers,
  getBookAvailability
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/most-borrowed', authenticate, authorize('Admin'), getMostBorrowedBooks);
router.get('/active-members', authenticate, authorize('Admin'), getActiveMembers);
router.get('/book-availability', authenticate, authorize('Admin'), getBookAvailability);

module.exports = router;
