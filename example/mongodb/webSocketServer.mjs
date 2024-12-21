import { connectToDatabase, Client, Workflow } from './mongodb.mjs';
import WebSocket from 'ws';

// Connect to MongoDB
connectToDatabase();

const wss = new WebSocket.Server({ port: 8080 }); // WebSocket server on port 8080

// Map to store connected clients
const clients = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Handle client registration
    if (data.type === 'register') {
      const { client_id } = data;
      clients.set(client_id, ws);
      console.log(`Client registered: ${client_id}`);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove client from map
    for (const [client_id, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(client_id);
        console.log(`Client unregistered: ${client_id}`);
      }
    }
  });
});

// Function to process clients and workflows
const processClientsAndWorkflows = async () => {
  console.log('Processing clients and workflows...');

  // Read all clients
  const allClients = await Client.find();
  for (const client of allClients) {
    const { client_id } = client;

    // Read all workflows associated with the client_id
    const workflows = await Workflow.find({ client_id });

    // Prepare data to send to the frontend
    const updates = workflows.map((workflow) => ({
      run_id: workflow.run_id,
      status: workflow.status,
      conclusion: workflow.conclusion,
    }));

    // Send updates to the connected WebSocket client
    const ws = clients.get(client_id);
    if (ws) {
      ws.send(JSON.stringify({ type: 'update', data: updates }));
      console.log(`Sent updates to client ${client_id}:`, updates);
    } else {
      console.log(`No active WebSocket connection for client ${client_id}`);
    }
  }
};

// Poll every 30 seconds
setInterval(processClientsAndWorkflows, 30000);

console.log('WebSocket server is running on ws://localhost:8080');

