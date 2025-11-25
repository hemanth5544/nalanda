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

const returnBook = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const userId = req.user.userId;

    const borrowing = await Borrowing.findById(borrowingId);

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    if (borrowing.user.toString() !== userId.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only return your own borrowed books'
      });
    }

    if (borrowing.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned'
      });
    }

    borrowing.returnDate = new Date();
    borrowing.status = 'Returned';
    await borrowing.save();

    const book = await Book.findById(borrowing.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('user', 'name email')
      .populate('book', 'title author isbn');

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: populatedBorrowing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
};

const getBorrowHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const borrowings = await Borrowing.find(query)
      .populate('book', 'title author isbn genre')
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Borrowing.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        borrowings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching borrow history',
      error: error.message
    });
  }
};

const getAllBorrowings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const borrowings = await Borrowing.find(query)
      .populate('user', 'name email')
      .populate('book', 'title author isbn genre')
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Borrowing.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        borrowings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowings',
      error: error.message
    });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getBorrowHistory,
  getAllBorrowings
};
