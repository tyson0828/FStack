// src/components/WebSocketListener.js

import React, { useEffect, useState } from 'react';

const WebSocketListener = ({ clientId }) => {
  const [queryStatus, setQueryStatus] = useState('');
  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      // Register the client on connection
      socket.send(JSON.stringify({ type: 'register', clientId }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message from server:', message);

      if (message.type === 'queryProcessing') {
        setQueryStatus('Query is being processed...');
      } else if (message.type === 'queryReady') {
        setQueryStatus('Query is ready.');
        setQueryResults(message.queryResults);
      } else if (message.type === 'error') {
        setQueryStatus(`Error: ${message.message}`);
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, [clientId]);

  return (
    <div>
      <h3>Query Status: {queryStatus}</h3>
      {queryResults && <pre>{JSON.stringify(queryResults, null, 2)}</pre>}
    </div>
  );
};

export default WebSocketListener;
