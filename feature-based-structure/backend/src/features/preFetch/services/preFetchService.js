// src/features/preFetch/services/preFetchService.js
const { KubeConfig } = require('kubernetes-client');
const Client = require('kubernetes-client').Client
const Request = require('kubernetes-client/backends/request')
const axios = require('axios');
const logger = require('../../../utils/logger');
const { sendToQueue } = require('../producers/preFetchProducer');


const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const backend = new Request({ kubeconfig });
const client = new Client({ backend, version: '1.13' })



// Configure Kubernetes Client
//const kubeconfig = new KubeConfig();
//kubeconfig.loadFromDefault(); // Loads kubeconfig from default location (usually ~/.kube/config)

//const client = new Client({ config: kubeconfig });



// Function to create a SQL query from user inputs
const createSQLQuery = (values) => {
  // Construct a basic SQL SELECT statement based on values
  const whereConditions = values.map((input) => {
    return `${input.columnName} = '${input.value}'`;
  }).join(' AND ');

  const sqlQuery = `SELECT * FROM some_table WHERE ${whereConditions};`;
  logger.info('SQL Query Created', { sqlQuery });

  return sqlQuery;
};

// Function to send the SQL query to the Kubernetes job
const sendSQLQueryToK8sJob = async (sqlQuery) => {
  try {
    // Assuming the Kubernetes job is exposed via an HTTP endpoint
    const k8sJobUrl = 'http://k8s-job-service/query'; // Replace with your Kubernetes job service URL

    // Send the SQL query to the Kubernetes job
    const response = await axios.post(k8sJobUrl, { query: sqlQuery });
    logger.info('Kubernetes Job Response', { data: response.data });

    return response.data; // Return the query results from the Kubernetes job
  } catch (error) {
    logger.error('Error Sending SQL Query to Kubernetes Job', { error: error.message });
    throw error;
  }
};

// Function to process user inputs, form SQL query, and send results to ActiveMQ
const processUserInputs = async (clientId, requestId, values) => {
  try {
    // Form the SQL query based on user inputs
    const sqlQuery = createSQLQuery(values);

    // Send the SQL query to the Kubernetes job and await the results
    const queryResults = await sendSQLQueryToK8sJob(sqlQuery);

    // Create the message payload
    const messagePayload = {
      clientId,
      requestId,
      queryResults,
    };

    // Send the message payload to ActiveMQ queue
    await sendToQueue('preFetchResultsQueue', messagePayload);

    logger.info('Query processed and results sent to ActiveMQ', { clientId, requestId, queryResults });
  } catch (error) {
    logger.error('Failed to process user inputs', { error: error.message });
    throw error;
  }
};

// Function to create a Kubernetes Job for querying the database
const createKubernetesJob = async (query) => {
  const jobName = `wafer-query-job-${Date.now()}`;

  // Kubernetes Job Definition
  const jobManifest = {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: jobName,
      namespace: process.env.NAMESPACE, // Replace with your namespace
    },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: 'wafer-query',
              image: 'your-database-query-image:latest', // Replace with your container image
              command: ['sh', '-c', `node queryDatabase.js "${query}"`], // Replace with your query execution command
              env: [
                { name: 'DB_HOST', value: process.env.DB_HOST },
                { name: 'DB_USER', value: process.env.DB_USER },
                { name: 'DB_PASSWORD', value: process.env.DB_PASSWORD },
                { name: 'DB_NAME', value: process.env.DB_NAME },
              ],
            },
          ],
          restartPolicy: 'Never',
        },
      },
    },
  };

  try {
    // Create the Job in the Kubernetes cluster
    await client.apis.batch.v1.namespaces(process.env.NAMESPACE).jobs.post({ body: jobManifest });
    logger.info('Kubernetes Job created successfully', { jobName });
    return jobName;
  } catch (error) {
    logger.error('Error creating Kubernetes Job', { error });
    throw error;
  }
};

// Function to wait for the Job to complete and retrieve logs
const getJobResults = async (jobName) => {
  try {
    let jobStatus;
    // Poll for job completion
    while (true) {
      const job = await client.apis.batch.v1.namespaces(process.env.NAMESPACE).jobs(jobName).get();
      jobStatus = job.body.status;
      if (jobStatus.succeeded === 1) {
        break; // Job succeeded
      } else if (jobStatus.failed >= 1) {
        throw new Error('Job failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before polling again
    }

    // Get Job Pod logs
    const podName = `${jobName}-pod`;
    const logs = await client.api.v1.namespaces(process.env.NAMESPACE).pods(podName).log.get();
    logger.info('Job Logs', { logs: logs.body });
    return logs.body;
  } catch (error) {
    logger.error('Error retrieving Job results', { error });
    throw error;
  }
};

// Function to execute the query in the Kubernetes container
const executeAndSendQuery = async (userValues) => {
  try {
    // Construct the query
    const query = createSQLQuery(userValues);

    // Create the Kubernetes Job
    const jobName = await createKubernetesJob(query);

    // Wait for the Job to complete and get the results
    const results = await getJobResults(jobName);

    // Process the results or send them to an external service as needed
    // const response = await axios.post('http://external-service:5000/process-query', { results });

    // Log the response from the external service
    // logger.info('External Service Response', { response: response.data });

    //return response.data;
    return results 
  } catch (error) {
    logger.error('Error executing and sending query', { error });
    throw error;
  }
};

module.exports = {
  createSQLQuery,
  sendSQLQueryToK8sJob,
  processUserInputs,
  executeAndSendQuery,
};

