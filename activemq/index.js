// src/index.js

// Load environment variables
require('dotenv').config();

const express = require('express');
const stompit = require('stompit');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { connectToActiveMQ } = require('./config/activemqConfig');
const routes = require('./api/routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { startConsumers } = require('./consumers');

const app = express();

// Middleware for security headers
app.use(helmet());

// Middleware for logging requests
app.use(morgan('dev'));

// Middleware for parsing request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error Handling Middleware
app.use(errorHandler);

// Start the server and connect to ActiveMQ
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to ActiveMQ
    await connectToActiveMQ();
    console.log('Connected to ActiveMQ successfully');

    // Start ActiveMQ consumers
    startConsumers();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); // Exit the process with an error code
  }
};

// Start the server
startServer();

