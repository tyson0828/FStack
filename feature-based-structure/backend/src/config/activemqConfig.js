// src/config/activemqConfig.js

const stompit = require('stompit');

// ActiveMQ connection options
const connectOptions = {
  host: process.env.ACTIVEMQ_HOST || 'localhost',
  port: process.env.ACTIVEMQ_PORT || 61613,
  connectHeaders: {
    host: '/',
    login: process.env.ACTIVEMQ_USER || 'admin',
    passcode: process.env.ACTIVEMQ_PASSWORD || 'admin',
    'heart-beat': '5000,5000',
  },
};

// Function to get a connected client
const getClient = () => {
  return new Promise((resolve, reject) => {
    stompit.connect(connectOptions, (error, client) => {
      if (error) {
        return reject(error);
      }
      resolve(client);
    });
  });
};

// Function to close the client connection
const closeClient = (client) => {
  if (client) {
    client.disconnect();
  }
};

module.exports = {
  getClient,
  closeClient,
};

