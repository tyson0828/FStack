
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const sendPreFetchRequest = (clientId, requestId, values) => {
  return api.post('/preFetch/request', { clientId, requestId, values });
};

export default api;
