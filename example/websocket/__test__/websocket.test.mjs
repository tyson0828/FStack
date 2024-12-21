import WebSocket from 'ws';

let server;
let port = 8081;

beforeAll(() => {
  // Start WebSocket server
  server = new WebSocket.Server({ port });
});

afterAll(() => {
  // Close WebSocket server
  server.close();
});

test('should handle WebSocket client registration and updates', (done) => {
  // Mock server-side WebSocket behavior
  server.on('connection', (ws) => {
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'register') {
        expect(data.client_id).toBe('client-001');
        ws.send(JSON.stringify({ type: 'update', data: [{ run_id: 12345, status: 'completed' }] }));
      }
    });
  });

  // Connect a WebSocket client
  const client = new WebSocket(`ws://localhost:${port}`);

  client.on('open', () => {
    // Register the client
    client.send(JSON.stringify({ type: 'register', client_id: 'client-001' }));
  });

  client.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'update') {
      expect(data.data).toEqual([{ run_id: 12345, status: 'completed' }]);
      done();
    }
  });
});

