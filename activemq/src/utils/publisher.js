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

// Utility function to send a message
const sendMessage = async (client, message, queue = '/queue/test') => {
  return new Promise((resolve, reject) => {
    const sendHeaders = {
      destination: queue,
      'content-type': 'text/plain'
    };

    const frame = client.send(sendHeaders);
    frame.write(message);
    frame.end();

    frame.on('error', (error) => reject(`Send error: ${error.message}`));
    frame.on('finish', () => resolve('Message sent successfully'));
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
    const result = await sendMessage(client, 'Hello, this is an enhanced message from Node.js!');
    console.log(result);

    client.disconnect();
  } catch (error) {
    console.error(error);
  }
})();
