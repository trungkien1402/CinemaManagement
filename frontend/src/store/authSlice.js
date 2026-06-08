import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);

            console.log("RESPONSE LOGIN BAN ĐẦU:", response.data);

            // tùy theo api login của bạn, dữ liệu trả về thường nằm trong response.data.result hoặc response.data.data
            // Đoạn này kiểm tra nếu có tầng .result hoặc .data thì lấy, không thì lấy trực tiếp response.data
            const serverData = response.data;
            const userData = serverData.result || serverData.data || serverData;

            // Tiến hành lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(userData));

            // tìm kiếm token ở cả tầng ngoài lẫn tầng trong của object trả về
            const token = userData.token || serverData.token || userData.accessToken || serverData.accessToken;

            if (token) {
                // Lưu cả hai biến token để khớp hoàn toàn với logic check bên AdminDashboard
                localStorage.setItem('token', token);
                localStorage.setItem('accessToken', token);
                console.log("XÁC THỰC THÀNH CÔNG - TOKEN ĐÃ LƯU:", token);
            } else {
                console.warn("CẢNH BÁO: Đăng nhập thành công nhưng không tìm thấy trường token/accessToken trong JSON trả về!");
            }

            return userData;
        } catch (err) {
            console.error("LỖI ĐĂNG NHẬP:", err.response?.data);
            return rejectWithValue(
                err.response?.data?.message || 
                err.response?.data || 
                "Lỗi kết nối server"
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',

    initialState: {
        // Khởi tạo state từ localStorage nếu user đã đăng nhập trước đó
        user: JSON.parse(localStorage.getItem('user')) || null,
        loading: false,
        error: null,
    },

    reducers: {
        logout: (state) => {
            // Xóa sạch toàn bộ session liên quan đến token khi logout
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');

            state.user = null;
            state.error = null;
            console.log("ĐÃ ĐĂNG XUẤT - XÓA TOKEN");
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
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;