const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    publicationDate: String!
    genre: String!
    totalCopies: Int!
    availableCopies: Int!
    createdAt: String!
  }

  type Borrowing {
    id: ID!
    user: User!
    book: Book!
    borrowDate: String!
    dueDate: String!
    returnDate: String
    status: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type BorrowedBook {
    bookId: ID!
    title: String!
    author: String!
    isbn: String!
    genre: String!
    borrowCount: Int!
  }

  type ActiveMember {
    userId: ID!
    name: String!
    email: String!
    totalBorrowings: Int!
    activeBorrowings: Int!
  }

  type GenreAvailability {
    genre: String!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    numberOfBooks: Int!
  }

  type AvailabilitySummary {
    totalBooks: Int!
    availableBooks: Int!
    borrowedBooks: Int!
    borrowedCopies: Int!
  }

  type BookAvailability {
    summary: AvailabilitySummary!
    genreWiseAvailability: [GenreAvailability!]!
  }

  type PaginatedBooks {
    books: [Book!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type PaginatedBorrowings {
    borrowings: [Borrowing!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type Query {
    books(page: Int, limit: Int, genre: String, author: String, search: String): PaginatedBooks!
    book(id: ID!): Book
    borrowHistory(page: Int, limit: Int, status: String): PaginatedBorrowings!
    allBorrowings(page: Int, limit: Int, status: String, userId: ID): PaginatedBorrowings!
    mostBorrowedBooks(limit: Int): [BorrowedBook!]!
    activeMembers(limit: Int): [ActiveMember!]!
    bookAvailability: BookAvailability!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addBook(title: String!, author: String!, isbn: String!, publicationDate: String!, genre: String!, totalCopies: Int!): Book!
    updateBook(id: ID!, title: String, author: String, isbn: String, publicationDate: String, genre: String, totalCopies: Int): Book!
    deleteBook(id: ID!): Boolean!
    borrowBook(bookId: ID!): Borrowing!
    returnBook(borrowingId: ID!): Borrowing!
  }
`);

module.exports = schema;
