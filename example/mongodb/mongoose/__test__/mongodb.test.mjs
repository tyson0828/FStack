import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectToDatabase, Client, Workflow } from './mongodb.mjs';

let mongoServer;

beforeAll(async () => {
  // Start an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Override default MongoDB connection
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Close MongoDB connection and stop server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await Client.deleteMany({});
  await Workflow.deleteMany({});
});

test('should create and retrieve a client', async () => {
  const client = new Client({
    client_id: 'client-001',
    last_active_time: new Date(),
    idsid: 'id-12345',
  });
  await client.save();

  const foundClient = await Client.findOne({ client_id: 'client-001' });
  expect(foundClient).not.toBeNull();
  expect(foundClient.idsid).toBe('id-12345');
});

test('should create and retrieve a workflow', async () => {
  const workflow = new Workflow({
    run_id: 12345,
    client_id: 'client-001',
    request_id: 'req-abc-123',
    status: 'queued',
    conclusion: null,
  });
  await workflow.save();

  const foundWorkflow = await Workflow.findOne({ run_id: 12345 });
  expect(foundWorkflow).not.toBeNull();
  expect(foundWorkflow.status).toBe('queued');
});

test('should update workflow status and conclusion', async () => {
  const workflow = new Workflow({
    run_id: 12345,
    client_id: 'client-001',
    request_id: 'req-abc-123',
    status: 'queued',
    conclusion: null,
  });
  await workflow.save();

  const updatedWorkflow = await Workflow.findOneAndUpdate(
    { run_id: 12345 },
    { status: 'completed', conclusion: 'success' },
    { new: true }
  );

  expect(updatedWorkflow.status).toBe('completed');
  expect(updatedWorkflow.conclusion).toBe('success');
});

