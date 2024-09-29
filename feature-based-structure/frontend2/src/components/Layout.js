// src/components/Layout.js

import React, { useState } from 'react';
import PreFetchRequest from './PreFetchRequest';
import WebSocketListener from './WebSocketListener';

function Layout() {
  const [clientId] = useState('unique-client-id'); // Replace with dynamic client ID if needed
  const [requestId, setRequestId] = useState('');
  const [values, setValues] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h1>BritaC PreFetch System</h1>
      <div style={{ marginBottom: '20px' }}>
        <PreFetchRequest
          clientId={clientId}
          requestId={requestId}
          values={values}
          setRequestId={setRequestId}
          setValues={setValues}
        />
      </div>
      <WebSocketListener clientId={clientId} />
    </div>
  );
}

export default Layout;
