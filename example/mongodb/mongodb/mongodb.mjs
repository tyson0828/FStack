import { MongoClient, ObjectId } from 'mongodb';

const connectStr =
  'mongodb://' +
  process.env.USER_NAME +
  ':' +
  process.env.PASS +
  process.env.MONGO_URI;

let db;

// Function to connect to MongoDB
export const connectToDatabase = async () => {
  if (!db) {
    const client = new MongoClient(connectStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db('workflowsDB');
    console.log('Connected to MongoDB');
  }
  return db;
};

// Utility functions for the clients collection
export const Clients = {
  insert: async (clientData) => {
    const database = await connectToDatabase();
    const result = await database.collection('clients').insertOne(clientData);
    return result.insertedId;
  },
  findAll: async () => {
    const database = await connectToDatabase();
    return await database.collection('clients').find({}).toArray();
  },
};

// Utility functions for the workflows collection
export const Workflows = {
  insert: async (workflowData) => {
    const database = await connectToDatabase();
    const result = await database.collection('workflows').insertOne(workflowData);
    return result.insertedId;
  },
  findByClientId: async (client_id) => {
    const database = await connectToDatabase();
    return await database.collection('workflows').find({ client_id }).toArray();
  },
  updateStatus: async (run_id, updates) => {
    const database = await connectToDatabase();
    return await database
      .collection('workflows')
      .updateOne({ run_id }, { $set: updates });
  },
};

