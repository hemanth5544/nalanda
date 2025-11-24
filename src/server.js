require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const { apiReference } =require ('@scalar/express-api-reference');
const path = require('path');
app.use('/openapi.json', express.static(path.join(__dirname, '../openapi.json')));

app.use(
  '/reference',
  apiReference({
    theme: 'purple',
    url: '/openapi.json',
  })
);



const app = express();

connectDB();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
  console.log(`REST API: http://localhost:${PORT}/reference`);
  console.log(`GraphQL API: http://localhost:${PORT}/graphql`);
});

module.exports = app;
