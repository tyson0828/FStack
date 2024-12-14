// src/api/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Route to send a message to ActiveMQ
router.post('/send', messageController.sendMessage);

// Route to handle other message-related operations, like receiving or deleting messages
// Example: router.post('/receive', messageController.receiveMessage);

// You can add more routes for different operations as needed
// router.delete('/delete', messageController.deleteMessage);

module.exports = router;

