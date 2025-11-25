
## Database Schema

### Users Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: Admin/Member, default: Member),
  createdAt: Date,
  updatedAt: Date
}
```

### Books Collection
```javascript
{
  title: String (required),
  author: String (required),
  isbn: String (required, unique),
  publicationDate: Date (required),
  genre: String (required),
  totalCopies: Number (required),
  availableCopies: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Borrowings Collection
```javascript
{
  user: ObjectId (ref: User, required),
  book: ObjectId (ref: Book, required),
  borrowDate: Date (default: now),
  dueDate: Date (default: 14 days from borrow),
  returnDate: Date (nullable),
  status: String (enum: Borrowed/Returned/Overdue),
  createdAt: Date
}
```