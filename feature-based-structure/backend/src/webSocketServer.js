// src/webSocketServer.js

const WebSocket = require('ws');
const logger = require('./utils/logger');

// Create a WebSocket Server
const wss = new WebSocket.Server({ port: 8080 }); // Ensure this is the correct port

// Track connected clients by clientId
const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'register') {
        // Register client with clientId
        const { clientId } = data;
        if (clientId) {
          clients.set(clientId, ws);
          logger.info(`Client registered with clientId: ${clientId}`);
          ws.send(JSON.stringify({ type: 'registration', status: 'success' }));
        }
      }
    } catch (error) {
      logger.error('Error parsing message from client:', error.message);
    }
  });

  ws.on('close', () => {
    // Remove the client from the map when the connection is closed
    for (const [clientId, clientSocket] of clients.entries()) {
      if (clientSocket === ws) {
        clients.delete(clientId);
        logger.info(`Client disconnected: ${clientId}`);
        break;
      }
    }
  });
});

// Export the WebSocket server instance
module.exports = {
  wss,
  sendMessageToClient: (clientId, message) => {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      logger.info(`Sent message to client ${clientId}: ${JSON.stringify(message)}`);
    } else {
      logger.warn(`Client ${clientId} not connected or not ready`);
    }
  },
  broadcastMessage: (message) => {
    clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        logger.info(`Broadcast message to client ${clientId}: ${JSON.stringify(message)}`);
      }
    });
  }
};
