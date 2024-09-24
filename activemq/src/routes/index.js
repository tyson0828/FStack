// src/api/routes/index.js

const express = require('express');
const messageRoutes = require('./messageRoutes');

const router = express.Router();

// Mount message-related routes
router.use('/messages', messageRoutes);

module.exports = router;

