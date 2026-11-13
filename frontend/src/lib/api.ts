import axios from 'axios';

const SERVER_URL = 'https://doctor-tracker-backend-five.vercel.app/';

const api = axios.create({
  baseURL: `${SERVER_URL.replace(/\/$/, '')}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
