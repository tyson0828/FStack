// src/config/activemqConfig.js

const stompit = require('stompit');

let client = null;

const connectToActiveMQ = () => {
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

    stompit.connect(connectOptions, (error, activeMQClient) => {
      if (error) {
        console.error('ActiveMQ Connection Error:', error.message);
        return reject(error);
      }
      console.log('ActiveMQ Connected');
      client = activeMQClient;
      resolve(client);
    });
  });
};

const getClient = () => {
  if (!client) {
    throw new Error('ActiveMQ client not connected');
  }
  return client;
};

module.exports = { connectToActiveMQ, getClient };

