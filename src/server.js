const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users');
const connectDB = require('./config/connectDB');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
connectDB();

app.use(bodyParser.json());
app.use('/api/users', usersRoutes);

// Handle non-existing endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Handle server-side errors
app.use(errorHandler);

if (isProduction) {
  // Production mode
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} else {
  // Development mode
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
