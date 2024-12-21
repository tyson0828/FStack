import { WebSocketServer } from 'ws';
import { Clients, Workflows } from './mongodb.mjs';

// WebSocket server setup
const wss = new WebSocketServer({ port: 8080 });
const clientsMap = new Map();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      const { client_id } = data;
      clientsMap.set(client_id, ws);
      console.log(`Registered client: ${client_id}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    for (const [client_id, socket] of clientsMap.entries()) {
      if (socket === ws) {
        clientsMap.delete(client_id);
        console.log(`Unregistered client: ${client_id}`);
      }
    }
  });
});

// Polling function to update clients
const pollClientsAndWorkflows = async () => {
  const clients = await Clients.findAll();

  for (const client of clients) {
    const { client_id } = client;

    const workflows = await Workflows.findByClientId(client_id);
    const updates = workflows.map((workflow) => ({
      run_id: workflow.run_id,
      status: workflow.status,
      conclusion: workflow.conclusion,
    }));

    const ws = clientsMap.get(client_id);
    if (ws) {
      ws.send(JSON.stringify({ type: 'update', data: updates }));
      console.log(`Sent updates to client ${client_id}:`, updates);
    }
  }
};

// Poll every 30 seconds
setInterval(pollClientsAndWorkflows, 30000);

console.log('WebSocket server running on ws://localhost:8080');

