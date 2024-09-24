const stompit = require('stompit');

// Utility function to create a connection
const connectToActiveMQ = (options) => {
  return new Promise((resolve, reject) => {
    stompit.connect(options, (error, client) => {
      if (error) {
        return reject(`Connection error: ${error.message}`);
      }
      resolve(client);
    });
  });
};

// Utility function to subscribe and receive messages
const subscribeToQueue = async (client, queue = '/queue/test') => {
  return new Promise((resolve, reject) => {
    const subscribeHeaders = {
      destination: queue,
      ack: 'client-individual'
    };

    client.subscribe(subscribeHeaders, (error, message) => {
      if (error) {
        return reject(`Subscribe error: ${error.message}`);
      }

      message.readString('utf-8', (error, body) => {
        if (error) {
          return reject(`Read message error: ${error.message}`);
        }

        console.log('Received message:', body);

        // Acknowledge the message
        client.ack(message);
        resolve('Message processed successfully');
      });
    });
  });
};

(async () => {
  const connectOptions = {
    host: 'localhost',
    port: 61613,
    connectHeaders: {
      host: '/',
      login: 'admin',
      passcode: 'admin',
      'heart-beat': '5000,5000'
    }
  };

  try {
    const client = await connectToActiveMQ(connectOptions);
    const result = await subscribeToQueue(client);
    console.log(result);

    client.disconnect();
  } catch (error) {
    console.error(error);
  }
})();
