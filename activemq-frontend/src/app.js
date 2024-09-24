import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [requestId, setRequestId] = useState('');
  const [data, setData] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const uniqueRequestId = uuidv4();
    setRequestId(uniqueRequestId);

    const requestData = {
      requestId: uniqueRequestId,
      data: data
    };

    try {
      // Send request to the backend
      const response = await fetch('http://localhost:3000/api/sendToQueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      // Update state with the backend response
      setResponse(result.message);
    } catch (error) {
      console.error('Error sending message to backend:', error);
      setResponse('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ActiveMQ Messaging System</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Data:</label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter data to send"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        {requestId && (
          <div>
            <p><strong>Request ID:</strong> {requestId}</p>
          </div>
        )}
        {response && (
          <div>
            <p><strong>Response:</strong> {response}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

