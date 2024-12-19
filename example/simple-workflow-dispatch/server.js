const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');

const app = express();
const port = 3000;

// Use body-parser to parse incoming JSON
app.use(bodyParser.json());

// Create an Octokit instance
const octokit = new Octokit({
  auth: 'your-personal-access-token', // Replace with your GitHub PAT
});

// GitHub repository details
const owner = 'your-username'; // Replace with the owner of the repo
const repo = 'your-repository'; // Replace with your repository name

// Endpoint to handle incoming GitHub webhook events
app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'];

  console.log(`Received event: ${event}`);
  console.log('Payload:', req.body);

  if (event === 'push') {
    try {
      // Trigger a GitHub Actions workflow
      const response = await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: 'your-workflow.yml', // Replace with the workflow file name
        ref: 'main', // Replace with the branch to trigger
        inputs: {
          customInput: 'value', // Add workflow inputs if required
        },
      });

      console.log('Workflow triggered:', response.data);
      res.status(200).send('Workflow triggered successfully');
    } catch (error) {
      console.error('Error triggering workflow:', error);
      res.status(500).send('Failed to trigger workflow');
    }
  } else {
    res.status(200).send('Event received but no action taken');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

