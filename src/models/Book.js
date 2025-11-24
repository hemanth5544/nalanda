const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [0, 'Total copies cannot be negative'],
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative'],
    default: function() {
      return this.totalCopies;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 1, author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ isbn: 1 });

module.exports = mongoose.model('Book', bookSchema);
