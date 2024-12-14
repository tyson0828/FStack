// src/features/preFetch/consumers/preFetchConsumer.js

const { getClient } = require('../../../config/activemqConfig');
const logger = require('../../../utils/logger');
const { sendMessageToClient } = require('../../../webSocketServer');

const startPreFetchConsumer = () => {
  try {
    const client = getClient();

    const subscribeHeaders = {
      destination: '/queue/preFetchResultsQueue', // Ensure this matches your queue name
      ack: 'client-individual', // Use client-individual ack mode for more granular control
    };

    // Subscribe to the queue
    client.subscribe(subscribeHeaders, (error, message) => {
      if (error) {
        logger.error('Subscription Error in preFetchConsumer', { error });
        return;
      }

      // Listen for incoming messages
      message.readString('utf-8', (error, body) => {
        if (error) {
          logger.error('Message Read Error in preFetchConsumer', { error });
          return;
        }

        logger.info('Received Message from ActiveMQ', { message: body });

        try {
          // Parse the message
          const parsedMessage = JSON.parse(body);
          const { clientId, requestId, queryResults } = parsedMessage;

          // Log the clientId, requestId, and query results
          logger.info('Processing Message', {
            clientId,
            requestId,
            queryResults,
          });

          // Send the query result back to the specific client via WebSocket
          sendMessageToClient(clientId, {
            type: 'queryResult',
            requestId,
            queryResults,
          });

          // Acknowledge the message after successful processing
          client.ack(message);
        } catch (processError) {
          logger.error('Error Processing Message', { error: processError, message: body });
        }
      });
    });

    logger.info('PreFetch Consumer Started');
  } catch (error) {
    logger.error('Error Starting PreFetch Consumer', { error });
  }
};

module.exports = { startPreFetchConsumer };

