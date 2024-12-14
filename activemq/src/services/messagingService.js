// src/services/messagingService.js

const stompit = require('stompit');
const logger = require('../utils/logger');

// Function to send a message to a specific queue
const sendMessageToQueue = (requestId, data) => {
  return new Promise((resolve, reject) => {
    const connectOptions = {
      host: process.env.ACTIVEMQ_HOST || 'localhost',
      port: process.env.ACTIVEMQ_PORT || 61613,
      connectHeaders: {
        host: '/',
        login: process.env.ACTIVEMQ_USER || 'admin',
        passcode: process.env.ACTIVEMQ_PASSWORD || 'admin',
        'heart-beat': '5000,5000'
      }
    };

    stompit.connect(connectOptions, (error, client) => {
      if (error) {
        logger.error('ActiveMQ Connection Error:', { error: error.message });
        return reject(error);
      }

      const sendHeaders = {
        destination: process.env.QUEUE_NAME || '/queue/your-queue',
        'content-type': 'application/json',
        'request-id': requestId // Include request ID in headers
      };

      const frame = client.send(sendHeaders);
      frame.write(JSON.stringify({ requestId, data })); // Include request ID and data in the message body
      frame.end();

      logger.info('Message sent to ActiveMQ', { requestId, data, queue: sendHeaders.destination });

      client.disconnect();
      resolve();
    });
  });
};

module.exports = { sendMessageToQueue };

