// src/components/PreFetchRequest.js

import React, { useState } from 'react';
import axios from 'axios';

const PreFetchRequest = ({ clientId, requestId, values, setRequestId, setValues }) => {
  const [status, setStatus] = useState('');

  const handlePreFetchRequest = async () => {
    try {
      setStatus('Sending request...');
      const response = await axios.post('http://localhost:3000/api/preFetch/request', {
        clientId,
        requestId,
        values: JSON.parse(values),
      });
      setStatus(response.data.message);
    } catch (error) {
      setStatus('Error sending request');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div>
        <label>Request ID: </label>
        <input
          type="text"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          placeholder="Enter Request ID"
        />
      </div>
      <div>
        <label>Values (JSON Array): </label>
        <textarea
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder='e.g. [{"columnName":"column1", "value":"value1"}]'
        />
      </div>
      <button onClick={handlePreFetchRequest}>Send PreFetch Request</button>
      <p>{status}</p>
    </div>
  );
};

export default PreFetchRequest;
