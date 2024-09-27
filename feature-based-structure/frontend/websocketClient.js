// websocketClient.js

// Establish a WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

// Elements
const clientIdInput = document.getElementById('clientId');
const requestIdInput = document.getElementById('requestId');
const valuesInput = document.getElementById('values');
const sendRequestButton = document.getElementById('sendRequest');
const queryResults = document.getElementById('queryResults');

// Event listener for connection open
socket.addEventListener('open', () => {
  console.log('Connected to the WebSocket server');
  // Register the client after connection
  const clientId = clientIdInput.value || 'defaultClientId';
  socket.send(JSON.stringify({ type: 'register', clientId }));
});

// Event listener for receiving messages
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Message received from server:', data);

  if (data.type === 'queryResult') {
    queryResults.textContent = JSON.stringify(data.queryResults, null, 2);
  }
});

// Event listener for connection close
socket.addEventListener('close', () => {
  console.log('Disconnected from the WebSocket server');
});

// Event listener for button click
sendRequestButton.addEventListener('click', () => {
  const clientId = clientIdInput.value;
  const requestId = requestIdInput.value;
  let values;

  try {
    values = JSON.parse(valuesInput.value);
  } catch (error) {
    alert('Invalid JSON format for values. Please enter a valid JSON array.');
    return;
  }

  if (clientId && requestId && Array.isArray(values)) {
    const preFetchRequest = {
      type: 'preFetch',
      clientId,
      requestId,
      values,
    };

    // Send pre-fetch request to the server
    socket.send(JSON.stringify(preFetchRequest));
    console.log('Sent pre-fetch request:', preFetchRequest);

    // Clear results area
    queryResults.textContent = 'Waiting for results...';
  } else {
    alert('Please fill in all fields with valid data.');
  }
});

