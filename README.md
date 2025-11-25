# Nalanda Library Management System

[API Documentation](https://nalanda-humen.up.railway.app/reference#post/apiauthregister).


A comprehensive backend system for a library management application with RESTful and GraphQL APIs, built with Node.js, Express, and MongoDB.

## Features

 **User Management**
- User registration with validation
- JWT-based login with encrypted tokens (AES encryption)
- Role-based access control (Admin & Member)
- Secure password hashing with bcrypt

 **Book Management**
- CRUD operations for books
- Book listing with pagination
- Advanced filtering by genre, author, or search query
- Copy availability tracking

 **Borrowing System**
- Borrow books with availability checks
- Return borrowed books
- Borrowing history tracking
- Due date management (14-day default)

 **Reports & Analytics**
- Most borrowed books aggregation
- Active members ranking
- Book availability summary
- Genre-wise availability breakdown

 **Dual API Support**
- Complete RESTful API with 14 endpoints
- Full GraphQL API with same functionality
- Consistent error handling across both APIs

 **Security**
- Encrypted JWT tokens (AES encryption)
- Password hashing with bcrypt (salt rounds: 12)
- Role-based authorization
- Input validation on all endpoints
- CORS enabled



## Project Structure

```
src/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   ├── authController.js     # User registration & login
│   ├── bookController.js     # Book CRUD operations
│   ├── borrowingController.js # Borrow/return logic
│   └── reportController.js   # Analytics & reports
├── graphql/
│   ├── schema.js             # GraphQL type definitions
│   ├── resolvers.js          # GraphQL resolvers
│   └── context.js            # GraphQL context setup
├── middleware/
│   ├── auth.js               # JWT authentication & authorization
│   └── validation.js         # Input validation rules
├── models/
│   ├── User.js               # User schema
│   ├── Book.js               # Book schema
│   └── Borrowing.js          # Borrowing records schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── bookRoutes.js         # Book endpoints
│   ├── borrowingRoutes.js    # Borrowing endpoints
│   └── reportRoutes.js       # Report endpoints
├── utils/
│   └── jwt.js                # Token generation & verification
└── server.js                 # Main Express app
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Steps

1. **Clone repository**
```bash
git clone <https://github.com/hemanth5544/nalanda.git>

```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/nalanda
PORT=5000
JWT_SECRET=
JWT_ENCRYPTION_KEY=
NODE_ENV=development
```



4. **Run development server**
```bash
npm run dev
```

5. **Run  server with build**
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### Books

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/books` | List all books | Authenticated |
| GET | `/api/books/:id` | Get single book | Authenticated |
| POST | `/api/books` | Add new book | Admin |
| PUT | `/api/books/:id` | Update book | Admin |
| DELETE | `/api/books/:id` | Delete book | Admin |

### Borrowing

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/borrowing/borrow` | Borrow book | Member/Admin |
| PUT | `/api/borrowing/return/:borrowingId` | Return book | Member/Admin |
| GET | `/api/borrowing/history` | Get borrow history | Member/Admin |
| GET | `/api/borrowing/all` | Get all borrowings | Admin |

### Reports

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/reports/most-borrowed` | Most borrowed books | Admin |
| GET | `/api/reports/active-members` | Active members list | Admin |
| GET | `/api/reports/book-availability` | Book availability report | Admin |

### GraphQL

| Endpoint | Description |
|----------|-------------|
| POST `/graphql` | GraphQL queries/mutations |
| GET `/graphql` | GraphiQL IDE (dev only) |


## Role-Based Access Control

**Member Role:**
- View all books
- Search & filter books
- Borrow and return books
- View own borrowing history

**Admin Role:**
- All member permissions
- Add, update, delete books
- View all borrowing records
- Access all reports & analytics

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

Status codes:
- `400`: Validation error
- `401`: Authentication required
- `403`: Permission denied
- `404`: Resource not found
- `500`: Server error


