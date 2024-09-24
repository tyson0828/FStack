// src/consumers/index.js

const userConsumer = require('./userConsumer');

const startConsumers = () => {
  // Start consumers for different message queues/topics
  userConsumer.start();
};

module.exports = { startConsumers };

