import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from "../api/api";

export const fetchMovie = createAsyncThunk(
    'movies/fetchMovie',
    async (_, thunkAPI) => {
        try {
            // Thay đổi endpoint thành '/movies/admin/all' nếu muốn đồng bộ chính xác với trang Admin
            const { data } = await api.get('/movies/admin/all');
            return data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const movieSlice = createSlice({
    name: 'movie',
    initialState: {
        listMovies: [],
        pagination: {},
        loading: false,
        error: null
    },
    reducers: {
        // Hàm xử lý đồng bộ xóa phim tạm thời khỏi danh sách Redux Store
        removeMovieFromList: (state, action) => {
            const movieIdToRemove = action.payload;
            state.listMovies = state.listMovies.filter(movie => movie.movieId !== movieIdToRemove);
        },
        // Hàm cập nhật hoặc reset thông tin lỗi/loading thủ công nếu cần
        clearMovieError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovie.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovie.fulfilled, (state, action) => {
                state.loading = false;
                console.log("Payload nhận được thực tế:", action.payload);
                
                // Đồng bộ linh hoạt:
                // Nếu dữ liệu trả về trực tiếp là mảng thì gán thẳng, ngược lại lấy từ thuộc tính .listMovies
                if (Array.isArray(action.payload)) {
                    state.listMovies = action.payload;
                    state.pagination = {}; // Không có phân trang từ API này
                } else if (action.payload && typeof action.payload === 'object') {
                    state.listMovies = action.payload.listMovies || [];
                    
                    if (action.payload.pageNumber !== undefined) {
                        state.pagination = {
                            pageNumber: action.payload.pageNumber,
                            pageSize: action.payload.pageSize,
                            totalElements: action.payload.totalElements,
                            totalPages: action.payload.totalPages,
                        };
                    }
                }
            })
            .addCase(fetchMovie.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Đã xảy ra lỗi không xác định";
            });
    }
});

export const { removeMovieFromList, clearMovieError } = movieSlice.actions;
export default movieSlice.reducer;