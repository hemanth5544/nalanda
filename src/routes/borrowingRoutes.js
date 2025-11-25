const express = require('express');
const router = express.Router();
const {
  borrowBook,

} = require('../controllers/borrowingController');
const { authenticate, authorize } = require('../middleware/auth');
const { borrowBookValidation } = require('../middleware/validation');

router.post('/borrow', authenticate, authorize('Member', 'Admin'), borrowBookValidation, borrowBook);


module.exports = router;
