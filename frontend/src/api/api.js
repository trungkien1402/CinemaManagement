import axios from "axios";

const api = axios.create({
    baseUR:'${import.meta.env.VITE_BACK_END_URL}/api',
});

export default api;