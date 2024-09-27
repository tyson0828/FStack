
import React, { useContext, useEffect, useState } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

const WebSocketListener = ({ clientId }) => {
  const { socket } = useContext(WebSocketContext);
  const [queryStatus, setQueryStatus] = useState('');
  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
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
  }, [socket, clientId]);

  return (
    <div>
      <h3>Query Status: {queryStatus}</h3>
      {queryResults && <pre>{JSON.stringify(queryResults, null, 2)}</pre>}
    </div>
  );
};

export default WebSocketListener;
