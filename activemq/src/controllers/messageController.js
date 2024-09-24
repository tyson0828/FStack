const { sendMessageToQueue } = require('../services/messagingService');

const sendToQueue = async (req, res) => {
  const { requestId, data } = req.body;

  try {
    await sendMessageToQueue(requestId, data);
    res.status(200).json({ message: 'Message sent to queue successfully', requestId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message to queue', details: error.message });
  }
};

module.exports = { sendToQueue };

