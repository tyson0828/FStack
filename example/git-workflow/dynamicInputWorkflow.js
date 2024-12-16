const { Octokit } = require("@octokit/rest");

async function triggerWorkflow(client_id, request_id) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = 'your-username';
  const repo = 'your-repo';
  const workflow_id = 'dynamic-input-workflow.yml'; // Workflow file name
  const ref = 'main'; // Branch name

  try {
    const response = await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref,
      inputs: {
        request_id: request_id,
      },
    });

    console.log(`Workflow triggered for Request ID: ${request_id}`);
  } catch (error) {
    console.error('Error triggering workflow:', error.message);
  }
}

async function mapRequestToRunId(request_id) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = 'your-username';
  const repo = 'your-repo';
  const workflow_id = 'dynamic-input-workflow.yml'; // Workflow file name

  try {
    // Fetch the latest workflow runs
    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id,
      per_page: 1, // Get the most recent run
    });

    const run = data.workflow_runs[0]; // Latest run
    if (run) {
      console.log(`Mapping Request ID: ${request_id} to Run ID: ${run.id}`);
      // Save this mapping in your backend database
      saveMappingToDatabase(request_id, run.id);
    } else {
      console.log(`No workflow runs found for workflow: ${workflow_id}`);
    }
  } catch (error) {
    console.error('Error fetching workflow runs:', error.message);
  }
}

// Example function to save the mapping (implement this based on your DB setup)
function saveMappingToDatabase(request_id, run_id) {
  console.log(`Saving to database: Request ID ${request_id} -> Run ID ${run_id}`);
  // Add your database logic here (e.g., MySQL, MongoDB, etc.)
}

async function getWorkflowStatus(request_id) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Fetch the Run ID from your database based on the request_id
  const run_id = fetchRunIdFromDatabase(request_id);

  if (!run_id) {
    console.error(`No Run ID found for Request ID: ${request_id}`);
    return;
  }

  const owner = 'your-username';
  const repo = 'your-repo';

  try {
    const { data } = await octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id,
    });

    console.log(`Workflow Status for Request ID ${request_id}:`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Conclusion: ${data.conclusion}`);
  } catch (error) {
    console.error(`Error fetching workflow status for Run ID ${run_id}:`, error.message);
  }
}

// Example function to fetch Run ID from your database
function fetchRunIdFromDatabase(request_id) {
  // Simulate a database lookup
  const database = {
    'unique-request-id-123': 123456789,
  };

  return database[request_id] || null;
}

// Example Usage
getWorkflowStatus('unique-request-id-123');


// Example Usage
mapRequestToRunId('unique-request-id-123');

// Example Usage
triggerWorkflow('unique-request-id-123');

