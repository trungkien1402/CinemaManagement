import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from "../api/api";


export const fetchMovie = createAsyncThunk(
    'movies/fetchMovie',
    async (_, thunkAPI) => {
        try {
            const { data } = await api.get('/public/movies');
            return data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
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
        // Nơi chứa các hàm xử lý đồng bộ (ví dụ: xóa phim khỏi danh sách tạm thời)
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovie.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMovie.fulfilled, (state, action) => {
                state.loading = false;
                state.listMovies = action.payload.content; 
                state.pagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalElements: action.payload.totalElements,
                    totalPages: action.payload.totalPages,
                };
            })
            .addCase(fetchMovie.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default movieSlice.reducer;