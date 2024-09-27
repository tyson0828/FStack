// src/features/preFetch/controllers/preFetchController.js

const { processUserInputs } = require('../services/preFetchService');
const { sendMessageToClient } = require('../../../webSocketServer');

// REST API controller to handle pre-fetch requests
const handlePreFetchRequest = async (req, res) => {
  try {
    const { clientId, requestId, values } = req.body;

    // Process the user inputs and run the query asynchronously
    processUserInputs(clientId, requestId, values)
      .then(() => {
        // Notify the client via WebSocket that the query is being processed
        sendMessageToClient(clientId, {
          type: 'queryProcessing',
          requestId,
          message: 'Your query is being processed. You will be notified once it is ready.',
        });
      })
      .catch((error) => {
        // Notify the client via WebSocket in case of error
        sendMessageToClient(clientId, {
          type: 'error',
          requestId,
          message: `Failed to process query: ${error.message}`,
        });
      });

    // Respond to the REST request indicating query is being processed
    res.status(202).json({
      message: 'Query is being processed. You will receive a WebSocket notification once it is ready.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process pre-fetch request', details: error.message });
  }
};

module.exports = {
  handlePreFetchRequest,
};

