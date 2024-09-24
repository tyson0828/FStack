// src/consumers/dlqConsumer.js

const { getClient } = require('../config/activemqConfig');
const logger = require('../utils/logger');

const start = () => {
  try {
    // Get the ActiveMQ client
    const client = getClient();

    // Define subscription headers for the DLQ
    const subscribeHeaders = {
      destination: 'ActiveMQ.DLQ', // The default DLQ name in ActiveMQ
      ack: 'client-individual' // Use client-individual ack mode
    };

    // Subscribe to the DLQ
    client.subscribe(subscribeHeaders, (error, message) => {
      if (error) {
        logger.error('Subscription Error in dlqConsumer', { error });
        return;
      }

      message.readString('utf-8', async (error, body) => {
        if (error) {
          logger.error('Message Read Error in dlqConsumer', { error });
          return;
        }

        logger.warn('Received Message from DLQ', { message: body });

        try {
          // Parse the DLQ message
          const dlqMessage = JSON.parse(body);

          // Implement your DLQ handling logic here
          // Example: Logging the message for manual review
          logger.warn('Processing DLQ Message', { dlqMessage });

          // If the message should be reprocessed, you can move it back to the original queue
          // or take any other necessary action here.

          // Acknowledge the DLQ message to prevent reprocessing
          client.ack(message);
          logger.info('DLQ Message Processed Successfully', { messageId: message.headers['message-id'] });
        } catch (processError) {
          // Log the error for later investigation
          logger.error('Error Processing DLQ Message', { error: processError, message: body });
        }
      });
    });

    logger.info('DLQ Consumer Started');
  } catch (error) {
    logger.error('Error Starting DLQ Consumer', { error });
  }
};

module.exports = { start };

