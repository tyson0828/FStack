// src/index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { startPreFetchConsumer } = require('./features/preFetch/consumers/preFetchConsumer');
const { wss } = require('./webSocketServer');
const logger = require('./utils/logger');
const preFetchRoutes = require('./features/preFetch/routes/preFetchRoutes');
const { handlePreFetchRequest } = require('./features/preFetch/controllers/preFetchController');

const app = express();
const port = process.env.PORT || 5000;
const wsPort = process.env.WS_PORT || 8080;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/preFetch', preFetchRoutes);

// Start the Express server
app.listen(port, () => {
  logger.info(`Express server running on http://localhost:${port}`);
});

// Start the WebSocket server
wss.on('connection', (ws) => {
  logger.info('New WebSocket connection established.');

  // Handle incoming WebSocket messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'register') {
        // Handle client registration
        const { clientId } = data;
        logger.info(`Client registered with clientId: ${clientId}`);
        ws.send(JSON.stringify({ type: 'registration', status: 'success' }));
      } else if (data.type === 'preFetch') {
        // Handle pre-fetch request from client
        const { clientId, requestId, values } = data;

        // Validate received data
        if (!clientId || !requestId || !Array.isArray(values)) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid request. Please provide a valid clientId, requestId, and values.',
            })
          );
          return;
        }

        logger.info(`Received preFetch request from client ${clientId} with requestId ${requestId}`);

        // Process the pre-fetch request
        try {
          await handlePreFetchRequest(clientId, requestId, values);
        } catch (error) {
          logger.error(`Failed to handle pre-fetch request for client ${clientId}: ${error.message}`);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: `Failed to process request: ${error.message}`,
            })
          );
        }
      }
    } catch (error) {
      logger.error('Error parsing message from client:', error.message);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid message format. Please send a valid JSON object.',
        })
      );
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed.');
  });
});

logger.info(`WebSocket server running on ws://localhost:${wsPort}`);

// Start the ActiveMQ consumer for preFetch results
startPreFetchConsumer();

