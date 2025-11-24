const Book = require('../models/Book');
const { validationResult } = require('express-validator');

const addBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, author, isbn, publicationDate, genre, totalCopies } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      publicationDate,
      genre,
      totalCopies,
      availableCopies: totalCopies
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.totalCopies !== undefined) {
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }

      const borrowed = book.totalCopies - book.availableCopies;
      updates.availableCopies = updates.totalCopies - borrowed;

      if (updates.availableCopies < 0) {
        return res.status(400).json({
          success: false,
          message: 'Total copies cannot be less than borrowed copies'
        });
      }
    }

    const book = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

const listBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, author, search } = req.query;

    const query = {};

    if (genre) {
      query.genre = new RegExp(genre, 'i');
    }

    if (author) {
      query.author = new RegExp(author, 'i');
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { isbn: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        books,
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
      message: 'Error fetching books',
      error: error.message
    });
  }
};

const getBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

module.exports = {
  addBook,
  updateBook,
  deleteBook,
  listBooks,
  getBook
};
