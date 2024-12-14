// src/features/preFetch/producers/preFetchProducer.js

const { getClient } = require('../../../config/activemqConfig');
const logger = require('../../../utils/logger');

// Function to send a message to a specific queue
const sendToQueue = async (queueName, message) => {
  try {
    // Get a connected client from the config
    const client = await getClient();

    const sendHeaders = {
      destination: queueName,
      'content-type': 'application/json',
    };

    // Create a frame to send the message
    const frame = client.send(sendHeaders);
    frame.write(JSON.stringify(message));
    frame.end();

    logger.info('Message sent to ActiveMQ', { message, queue: queueName });

    // Disconnect the client after sending the message
    client.disconnect();
  } catch (error) {
    logger.error('Failed to send message to ActiveMQ', { error: error.message });
  }
};

module.exports = { sendToQueue };


