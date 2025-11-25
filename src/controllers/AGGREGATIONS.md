## MongoDB Aggregations Used

1. **Most Borrowed Books**
   - Groups borrowing records by book
   - Counts borrowings per book
   - Sorts by count descending
   - Joins with book collection

2. **Active Members**
   - Groups borrowing records by user
   - Counts total and active borrowings
   - Sorts by count descending
   - Joins with user collection

3. **Book Availability**
   - Calculates total and available copies
   - Groups by genre for detailed view
   - Provides borrowed count