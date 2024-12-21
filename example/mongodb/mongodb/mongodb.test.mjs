import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { Clients, Workflows } from './mongodb.mjs';

let mongoServer, client, db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db('workflowsDB');
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('clients').deleteMany({});
  await db.collection('workflows').deleteMany({});
});

test('should insert and retrieve a client', async () => {
  const clientData = {
    client_id: 'client-001',
    last_active_time: new Date(),
    idsid: 'id-12345',
  };
  const insertedId = await Clients.insert(clientData);
  expect(insertedId).toBeDefined();

  const allClients = await Clients.findAll();
  expect(allClients).toHaveLength(1);
  expect(allClients[0].client_id).toBe('client-001');
});

test('should insert and retrieve workflows by client_id', async () => {
  const workflowData = {
    run_id: 12345,
    client_id: 'client-001',
    request_id: 'req-abc-123',
    status: 'queued',
    conclusion: null,
  };
  await Workflows.insert(workflowData);

  const workflows = await Workflows.findByClientId('client-001');
  expect(workflows).toHaveLength(1);
  expect(workflows[0].status).toBe('queued');
});

test('should update workflow status and conclusion', async () => {
  const workflowData = {
    run_id: 12345,
    client_id: 'client-001',
    request_id: 'req-abc-123',
    status: 'queued',
    conclusion: null,
  };
  await Workflows.insert(workflowData);

  await Workflows.updateStatus(12345, { status: 'completed', conclusion: 'success' });

  const workflows = await Workflows.findByClientId('client-001');
  expect(workflows[0].status).toBe('completed');
  expect(workflows[0].conclusion).toBe('success');
});

