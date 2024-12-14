// src/config/activemqConfig.js

const stompit = require('stompit');
const logger = require('../utils/logger');

// Connection options for multiple ActiveMQ brokers
const connectOptions = [
  {
    host: process.env.ACTIVEMQ_HOST_1 || 'localhost',
    port: parseInt(process.env.ACTIVEMQ_PORT_1, 10) || 61613,
    connectHeaders: {
      host: '/',
      login: process.env.ACTIVEMQ_USER_1 || 'admin',
      passcode: process.env.ACTIVEMQ_PASSWORD_1 || 'admin',
      'heart-beat': '5000,5000', // Heartbeat configuration
    },
  },
  {
    host: process.env.ACTIVEMQ_HOST_2 || 'localhost',
    port: parseInt(process.env.ACTIVEMQ_PORT_2, 10) || 61613,
    connectHeaders: {
      host: '/',
      login: process.env.ACTIVEMQ_USER_2 || 'admin',
      passcode: process.env.ACTIVEMQ_PASSWORD_2 || 'admin',
      'heart-beat': '5000,5000', // Heartbeat configuration
    },
  },
  // Add more host configurations as needed
];

// Retry options for reconnection
const reconnectOptions = {
  maxReconnects: 10, // Maximum number of reconnect attempts
  initialReconnectDelay: 1000, // Initial delay before attempting the first reconnect (ms)
  maxReconnectDelay: 30000, // Maximum delay between reconnection attempts (ms)
  reconnectDelayIncrement: 1000, // Incremental increase in reconnect delay after each attempt (ms)
};

// Function to create a connected client with reconnect logic
const getClient = (callback) => {
  const reconnect = new stompit.ConnectFailover(connectOptions, reconnectOptions);

  reconnect.connect((error, client, reconnectCallback) => {
    if (error) {
      logger.error(`Failed to connect to ActiveMQ: ${error.message}`);
      if (reconnectCallback) reconnectCallback(); // Retry connection
      return callback(error, null);
    }

    client.on('error', (err) => {
      logger.error(`ActiveMQ client error: ${err.message}`);
      client.disconnect();
      if (reconnectCallback) reconnectCallback(); // Retry connection
    });

    logger.info('Connected to ActiveMQ');
    return callback(null, client);
  });
};

// Function to send a message to a specific queue
const sendMessage = (queueName, message, callback) => {
  getClient((error, client) => {
    if (error) {
      return callback(error);
    }

    const sendHeaders = {
      destination: queueName,
      'content-type': 'application/json',
    };

    const frame = client.send(sendHeaders);
    frame.write(JSON.stringify(message));
    frame.end();

    logger.info(`Message sent to queue ${queueName}: ${JSON.stringify(message)}`);
    client.disconnect();

    return callback(null);
  });
};

module.exports = {
  getClient,
  sendMessage,
};
