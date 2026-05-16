import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {

  const token = localStorage.getItem('token');

  console.log("TOKEN GỬI LÊN BACKEND:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("REQUEST HEADERS:", config.headers);

  return config;
});

export default axiosClient;