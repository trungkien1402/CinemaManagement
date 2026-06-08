import axios from "axios";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_BACK_END_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return `${envUrl}/api`;
  }
  if (!window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:8080/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;