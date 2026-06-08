import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (!window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:8080/api';
};

const replaceLocalhost = (obj) => {
  if (typeof obj === 'string') {
    if (obj.startsWith('http://localhost:8080')) {
      if (!window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
        return obj.replace('http://localhost:8080', window.location.origin);
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceLocalhost);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = replaceLocalhost(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const axiosClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => {
        response.data = replaceLocalhost(response.data);
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;