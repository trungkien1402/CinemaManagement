import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api'; 

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/login', credentials);
        const userData = response.data;

        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        return userData; 
    } catch (err) {
        return rejectWithValue(err.response?.data || "Lỗi kết nối server");
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => { 
                state.loading = true; 
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;