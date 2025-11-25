const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const { validationResult } = require('express-validator');

const borrowBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { bookId } = req.body;
    const userId = req.user.userId;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    const activeBorrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: 'Borrowed'
    });

    if (activeBorrowing) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
    }

    const borrowing = await Borrowing.create({
      user: userId,
      book: bookId
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('user', 'name email')
      .populate('book', 'title author isbn');

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: populatedBorrowing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error borrowing book',
      error: error.message
    });
  }
};


module.exports = {
  borrowBook,

};
