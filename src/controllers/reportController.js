const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');

const getMostBorrowedBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const mostBorrowed = await Borrowing.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          _id: 0,
          bookId: '$_id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          isbn: '$bookDetails.isbn',
          genre: '$bookDetails.genre',
          borrowCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: mostBorrowed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching most borrowed books',
      error: error.message
    });
  }
};

const getActiveMembers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activeMembers = await Borrowing.aggregate([
      {
        $group: {
          _id: '$user',
          borrowCount: { $sum: 1 },
          activeBorrowings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Borrowed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalBorrowings: '$borrowCount',
          activeBorrowings: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: activeMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active members',
      error: error.message
    });
  }
};

const getBookAvailability = async (req, res) => {
  try {
    const totalBooks = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: '$totalCopies' },
          availableBooks: { $sum: '$availableCopies' }
        }
      }
    ]);

    const borrowedCount = await Borrowing.countDocuments({ status: 'Borrowed' });

    const genreWiseAvailability = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          totalBooks: { $sum: '$totalCopies' },
          availableBooks: { $sum: '$availableCopies' },
          bookCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          totalCopies: '$totalBooks',
          availableCopies: '$availableBooks',
          borrowedCopies: { $subtract: ['$totalBooks', '$availableBooks'] },
          numberOfBooks: '$bookCount'
        }
      },
      {
        $sort: { genre: 1 }
      }
    ]);

    const summary = totalBooks.length > 0 ? {
      totalBooks: totalBooks[0].totalBooks,
      availableBooks: totalBooks[0].availableBooks,
      borrowedBooks: borrowedCount,
      borrowedCopies: totalBooks[0].totalBooks - totalBooks[0].availableBooks
    } : {
      totalBooks: 0,
      availableBooks: 0,
      borrowedBooks: 0,
      borrowedCopies: 0
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        genreWiseAvailability
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book availability',
      error: error.message
    });
  }
};

module.exports = {
  getMostBorrowedBooks,
  getActiveMembers,
  getBookAvailability
};
