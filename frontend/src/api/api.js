import axios from "axios";

// Cấu hình URL tập trung
const api = axios.create({
    baseURL: import.meta.env.VITE_BACK_END_URL 
        ? `${import.meta.env.VITE_BACK_END_URL}/api` 
        : "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;