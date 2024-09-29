// src/services/api.js

import axios from 'axios';

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Base URL pointing to the backend
});

// Function to send the preFetch request
export const sendPreFetchRequest = (clientId, requestId, values) => {
  return api.post('/preFetch/request', { clientId, requestId, values });
};

export default api;
