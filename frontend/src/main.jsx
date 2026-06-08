import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'
import './i18n.js';
import axios from 'axios';

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

// Configure global axios interceptor to replace localhost:8080 dynamically in production
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:8080')) {
    if (!window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
      config.url = config.url.replace('http://localhost:8080', window.location.origin);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  response.data = replaceLocalhost(response.data);
  return response;
}, (error) => {
  return Promise.reject(error);
});



createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>,
  </Provider>
  
)
