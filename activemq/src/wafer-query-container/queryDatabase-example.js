// queryDatabase.js

const mysql = require('mysql2/promise'); // Use appropriate client for your database
const stompit = require('stompit');
const logger = console;

// Function to connect to the database and execute the query
const executeQuery = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const query = process.argv[2]; // The query passed as an argument to the script
  logger.log('Executing Query:', query);

  try {
    const [rows] = await connection.execute(query);
    logger.log('Query Results:', rows);

    await connection.end();

    return rows;
  } catch (error) {
    logger.error('Error executing query:', error);
    await connection.end();
    throw error;
  }
};

// Function to publish results to ActiveMQ
const publishToActiveMQ = (results) => {
  const connectOptions = {
    host: process.env.ACTIVEMQ_HOST,
    port: process.env.ACTIVEMQ_PORT,
    connectHeaders: {
      host: '/',
      login: process.env.ACTIVEMQ_USER,
      passcode: process.env.ACTIVEMQ_PASSWORD,
      'heart-beat': '5000,5000',
    },
  };

  stompit.connect(connectOptions, (error, client) => {
    if (error) {
      logger.error('ActiveMQ Connection Error:', error.message);
      return;
    }

    const sendHeaders = {
      destination: '/queue/query-results', // Replace with your destination queue/topic
      'content-type': 'application/json',
    };

    const frame = client.send(sendHeaders);
    frame.write(JSON.stringify(results)); // Convert results to JSON string
    frame.end();

    logger.log('Results published to ActiveMQ');

    client.disconnect();
  });
};

// Main function to execute the query and publish results
const main = async () => {
  try {
    const results = await executeQuery();
    publishToActiveMQ(results);
  } catch (error) {
    logger.error('Error in main function:', error);
  }
};

main();

