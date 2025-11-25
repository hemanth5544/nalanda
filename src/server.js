require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const { apiReference } =require ('@scalar/express-api-reference');
const path = require('path');
const cors = require('cors');
const app = express();
const { graphqlHTTP } = require('express-graphql');


const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const reportRoutes = require('./routes/reportRoutes');



//---------------- GraphQL Setup ----------------//
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { getGraphQLContext } = require('./graphql/context');


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
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Nalanda Library Management System API',
    version: '1.0.0',
    endpoints: {
      rest: {
        auth: '/api/auth',
        books: '/api/books',
        borrowing: '/api/borrowing',
        reports: '/api/reports'
      },
      graphql: '/graphql'
    }
  });
});
app.use('/graphql', graphqlHTTP((req) => ({
  schema,
  rootValue: resolvers,
  context: getGraphQLContext(req),
  graphiql: process.env.NODE_ENV === 'development',
  customFormatErrorFn: (error) => ({
    message: error.message,
    locations: error.locations,
    path: error.path
  })
})));
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
});

module.exports = app;
