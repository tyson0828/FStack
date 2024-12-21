import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/workflowsDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Define the schema for the clients collection
const clientSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
    unique: true,
  },
  last_active_time: {
    type: Date,
    required: true,
  },
  idsid: {
    type: String,
    required: true,
  },
});

// Define the schema for the workflows collection
const workflowSchema = new mongoose.Schema({
  run_id: {
    type: Number,
    required: true,
    unique: true,
  },
  client_id: {
    type: String,
    required: true,
  },
  request_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'queued', // Possible values: 'queued', 'in_progress', 'completed'
  },
  conclusion: {
    type: String,
    default: null, // Possible values: 'success', 'failure', 'neutral'
  },
});

// Create models for the clients and workflows collections
const Client = mongoose.model('Client', clientSchema);
const Workflow = mongoose.model('Workflow', workflowSchema);

export { connectToDatabase, Client, Workflow };

