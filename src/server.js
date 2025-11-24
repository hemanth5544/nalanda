require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

const app = express();

connectDB();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/api`);
  console.log(`GraphQL API: http://localhost:${PORT}/graphql`);
});

module.exports = app;
