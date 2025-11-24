require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const { apiReference } =require ('@scalar/express-api-reference');
const path = require('path');
const cors = require('cors');
const app = express();


const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');


app.use('/openapi.json', express.static(path.join(__dirname, '../openapi.json')));

app.use(
  '/reference',
  apiReference({
    theme: 'purple',
    url: '/openapi.json',
  })
);




connectDB();



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
  console.log(`REST API: http://localhost:${PORT}/reference`);
  console.log(`GraphQL API: http://localhost:${PORT}/graphql`);
});

module.exports = app;
