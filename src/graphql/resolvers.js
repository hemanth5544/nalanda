const User = require('../models/User');
const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');
const { generateToken } = require('../utils/jwt');

const resolvers = {
  register: async ({ name, email, password, role }, context) => {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User with this email already exists');

      const user = await User.create({ name, email, password, role: role || 'Member' });
      const token = generateToken({ userId: user._id, role: user.role });

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  login: async ({ email, password }, context) => {
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) throw new Error('Invalid email or password');

      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) throw new Error('Invalid email or password');

      const token = generateToken({ userId: user._id, role: user.role });

      return {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  books: async ({ page = 1, limit = 10, genre, author, search }, context) => {
    if (!context.user) throw new Error('Authentication required');

    try {
      const query = {};
      if (genre) query.genre = new RegExp(genre, 'i');
      if (author) query.author = new RegExp(author, 'i');
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { author: new RegExp(search, 'i') },
          { isbn: new RegExp(search, 'i') }
        ];
      }

      const skip = (page - 1) * limit;
      const books = await Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await Book.countDocuments(query);

      return {
        books: books.map(book => ({
          id: book._id.toString(),
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publicationDate: book.publicationDate.toISOString(),
          genre: book.genre,
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
          createdAt: book.createdAt.toISOString()
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  book: async ({ id }, context) => {
    if (!context.user) throw new Error('Authentication required');
    const book = await Book.findById(id);
    if (!book) return null;
    return {
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationDate: book.publicationDate.toISOString(),
      genre: book.genre,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      createdAt: book.createdAt.toISOString()
    };
  },

  addBook: async ({ title, author, isbn, publicationDate, genre, totalCopies }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can add books');

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) throw new Error('Book with this ISBN already exists');

    const book = await Book.create({
      title, author, isbn, publicationDate, genre, totalCopies, availableCopies: totalCopies
    });

    return {
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationDate: book.publicationDate.toISOString(),
      genre: book.genre,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      createdAt: book.createdAt.toISOString()
    };
  },

  updateBook: async ({ id, ...updates }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can update books');

    if (updates.totalCopies !== undefined) {
      const book = await Book.findById(id);
      if (!book) throw new Error('Book not found');
      const borrowed = book.totalCopies - book.availableCopies;
      updates.availableCopies = updates.totalCopies - borrowed;
      if (updates.availableCopies < 0) throw new Error('Total copies cannot be less than borrowed copies');
    }

    const book = await Book.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!book) throw new Error('Book not found');

    return {
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationDate: book.publicationDate.toISOString(),
      genre: book.genre,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      createdAt: book.createdAt.toISOString()
    };
  },

  deleteBook: async ({ id }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can delete books');
    const book = await Book.findByIdAndDelete(id);
    if (!book) throw new Error('Book not found');
    return true;
  },

  borrowBook: async ({ bookId }, context) => {
    if (!context.user) throw new Error('Authentication required');

    const userId = context.user.userId;
    const book = await Book.findById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) throw new Error('Book is not available for borrowing');

    const activeBorrowing = await Borrowing.findOne({ user: userId, book: bookId, status: 'Borrowed' });
    if (activeBorrowing) throw new Error('You have already borrowed this book');

    const borrowing = await Borrowing.create({ user: userId, book: bookId });
    book.availableCopies -= 1;
    await book.save();

    const populatedBorrowing = await Borrowing.findById(borrowing._id).populate('user').populate('book');

    return {
      id: populatedBorrowing._id.toString(),
      user: {
        id: populatedBorrowing.user._id.toString(),
        name: populatedBorrowing.user.name,
        email: populatedBorrowing.user.email,
        role: populatedBorrowing.user.role,
        createdAt: populatedBorrowing.user.createdAt.toISOString()
      },
      book: {
        id: populatedBorrowing.book._id.toString(),
        title: populatedBorrowing.book.title,
        author: populatedBorrowing.book.author,
        isbn: populatedBorrowing.book.isbn,
        publicationDate: populatedBorrowing.book.publicationDate.toISOString(),
        genre: populatedBorrowing.book.genre,
        totalCopies: populatedBorrowing.book.totalCopies,
        availableCopies: populatedBorrowing.book.availableCopies,
        createdAt: populatedBorrowing.book.createdAt.toISOString()
      },
      borrowDate: populatedBorrowing.borrowDate.toISOString(),
      dueDate: populatedBorrowing.dueDate.toISOString(),
      returnDate: null,
      status: populatedBorrowing.status
    };
  },

  returnBook: async ({ borrowingId }, context) => {
    if (!context.user) throw new Error('Authentication required');

    const userId = context.user.userId;
    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) throw new Error('Borrowing record not found');
    if (borrowing.user.toString() !== userId.toString() && context.user.role !== 'Admin') {
      throw new Error('You can only return your own borrowed books');
    }
    if (borrowing.status === 'Returned') throw new Error('Book has already been returned');

    borrowing.returnDate = new Date();
    borrowing.status = 'Returned';
    await borrowing.save();

    const book = await Book.findById(borrowing.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    const populatedBorrowing = await Borrowing.findById(borrowing._id).populate('user').populate('book');

    return {
      id: populatedBorrowing._id.toString(),
      user: {
        id: populatedBorrowing.user._id.toString(),
        name: populatedBorrowing.user.name,
        email: populatedBorrowing.user.email,
        role: populatedBorrowing.user.role,
        createdAt: populatedBorrowing.user.createdAt.toISOString()
      },
      book: {
        id: populatedBorrowing.book._id.toString(),
        title: populatedBorrowing.book.title,
        author: populatedBorrowing.book.author,
        isbn: populatedBorrowing.book.isbn,
        publicationDate: populatedBorrowing.book.publicationDate.toISOString(),
        genre: populatedBorrowing.book.genre,
        totalCopies: populatedBorrowing.book.totalCopies,
        availableCopies: populatedBorrowing.book.availableCopies,
        createdAt: populatedBorrowing.book.createdAt.toISOString()
      },
      borrowDate: populatedBorrowing.borrowDate.toISOString(),
      dueDate: populatedBorrowing.dueDate.toISOString(),
      returnDate: populatedBorrowing.returnDate.toISOString(),
      status: populatedBorrowing.status
    };
  },

  borrowHistory: async ({ page = 1, limit = 10, status }, context) => {
    if (!context.user) throw new Error('Authentication required');

    const userId = context.user.userId;
    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const borrowings = await Borrowing.find(query).populate('user').populate('book')
      .sort({ borrowDate: -1 }).skip(skip).limit(limit);
    const total = await Borrowing.countDocuments(query);

    return {
      borrowings: borrowings.map(b => ({
        id: b._id.toString(),
        user: {
          id: b.user._id.toString(),
          name: b.user.name,
          email: b.user.email,
          role: b.user.role,
          createdAt: b.user.createdAt.toISOString()
        },
        book: {
          id: b.book._id.toString(),
          title: b.book.title,
          author: b.book.author,
          isbn: b.book.isbn,
          publicationDate: b.book.publicationDate.toISOString(),
          genre: b.book.genre,
          totalCopies: b.book.totalCopies,
          availableCopies: b.book.availableCopies,
          createdAt: b.book.createdAt.toISOString()
        },
        borrowDate: b.borrowDate.toISOString(),
        dueDate: b.dueDate.toISOString(),
        returnDate: b.returnDate ? b.returnDate.toISOString() : null,
        status: b.status
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  allBorrowings: async ({ page = 1, limit = 10, status, userId }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can view all borrowings');

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const skip = (page - 1) * limit;
    const borrowings = await Borrowing.find(query).populate('user').populate('book')
      .sort({ borrowDate: -1 }).skip(skip).limit(limit);
    const total = await Borrowing.countDocuments(query);

    return {
      borrowings: borrowings.map(b => ({
        id: b._id.toString(),
        user: {
          id: b.user._id.toString(),
          name: b.user.name,
          email: b.user.email,
          role: b.user.role,
          createdAt: b.user.createdAt.toISOString()
        },
        book: {
          id: b.book._id.toString(),
          title: b.book.title,
          author: b.book.author,
          isbn: b.book.isbn,
          publicationDate: b.book.publicationDate.toISOString(),
          genre: b.book.genre,
          totalCopies: b.book.totalCopies,
          availableCopies: b.book.availableCopies,
          createdAt: b.book.createdAt.toISOString()
        },
        borrowDate: b.borrowDate.toISOString(),
        dueDate: b.dueDate.toISOString(),
        returnDate: b.returnDate ? b.returnDate.toISOString() : null,
        status: b.status
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  mostBorrowedBooks: async ({ limit = 10 }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can view reports');

    const mostBorrowed = await Borrowing.aggregate([
      { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: limit },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
      { $unwind: '$bookDetails' },
      { $project: { _id: 0, bookId: '$_id', title: '$bookDetails.title', author: '$bookDetails.author', isbn: '$bookDetails.isbn', genre: '$bookDetails.genre', borrowCount: 1 } }
    ]);

    return mostBorrowed.map(b => ({
      bookId: b.bookId.toString(),
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      genre: b.genre,
      borrowCount: b.borrowCount
    }));
  },

  activeMembers: async ({ limit = 10 }, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can view reports');

    const activeMembers = await Borrowing.aggregate([
      { $group: { _id: '$user', borrowCount: { $sum: 1 }, activeBorrowings: { $sum: { $cond: [{ $eq: ['$status', 'Borrowed'] }, 1, 0] } } } },
      { $sort: { borrowCount: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $project: { _id: 0, userId: '$_id', name: '$userDetails.name', email: '$userDetails.email', totalBorrowings: '$borrowCount', activeBorrowings: 1 } }
    ]);

    return activeMembers.map(m => ({
      userId: m.userId.toString(),
      name: m.name,
      email: m.email,
      totalBorrowings: m.totalBorrowings,
      activeBorrowings: m.activeBorrowings
    }));
  },

  bookAvailability: async (args, context) => {
    if (!context.user || context.user.role !== 'Admin') throw new Error('Only admins can view reports');

    const totalBooks = await Book.aggregate([{ $group: { _id: null, totalBooks: { $sum: '$totalCopies' }, availableBooks: { $sum: '$availableCopies' } } }]);
    const borrowedCount = await Borrowing.countDocuments({ status: 'Borrowed' });
    const genreWiseAvailability = await Book.aggregate([
      { $group: { _id: '$genre', totalBooks: { $sum: '$totalCopies' }, availableBooks: { $sum: '$availableCopies' }, bookCount: { $sum: 1 } } },
      { $project: { _id: 0, genre: '$_id', totalCopies: '$totalBooks', availableCopies: '$availableBooks', borrowedCopies: { $subtract: ['$totalBooks', '$availableBooks'] }, numberOfBooks: '$bookCount' } },
      { $sort: { genre: 1 } }
    ]);

    const summary = totalBooks.length > 0 ? {
      totalBooks: totalBooks[0].totalBooks,
      availableBooks: totalBooks[0].availableBooks,
      borrowedBooks: borrowedCount,
      borrowedCopies: totalBooks[0].totalBooks - totalBooks[0].availableBooks
    } : { totalBooks: 0, availableBooks: 0, borrowedBooks: 0, borrowedCopies: 0 };

    return { summary, genreWiseAvailability };
  }
};

module.exports = resolvers;
