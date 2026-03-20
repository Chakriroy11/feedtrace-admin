import axios from 'axios';

const API = axios.create({
  // This automatically picks the Render URL from your .env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
});

export default API;