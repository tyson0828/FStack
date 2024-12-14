// src/api/controllers/messageController.js

const { sendMessageToQueue } = require('../../services/messagingService');
const logger = require('../../utils/logger');

// Controller function to handle sending a message to ActiveMQ
const sendMessage = async (req, res) => {
  const { requestId, data } = req.body;

  if (!requestId || !data) {
    return res.status(400).json({ error: 'Missing required fields: requestId or data' });
  }

  try {
    // Call the messaging service to send the message to the ActiveMQ queue
    await sendMessageToQueue(requestId, data);
    res.status(200).json({ message: 'Message sent to queue successfully', requestId });
  } catch (error) {
    logger.error('Failed to send message to queue', { error: error.message });
    res.status(500).json({ error: 'Failed to send message to queue', details: error.message });
  }
};

module.exports = {
  sendMessage
};

