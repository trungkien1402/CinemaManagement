import MovieCard from '../shared/MovieCard';
import '../style/NowShowing.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import React, { memo, useEffect } from 'react';

const ComingSoon = () => {
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Đang tải phim...</div>;

    // 💡 SỬA TẠI ĐÂY: Đổi thành status === 2 và thêm kiểm tra an toàn bằng toán tử ba ngôi để tránh lỗi crash web
    const comingSoon = listMovies ? listMovies.filter(movie => movie.status === 2) : [];

    console.log("Dữ liệu phim sắp chiếu nè:", comingSoon);

    return (
        <div className="section-header-nowshowing">
            {/* 💡 SỬA TẠI ĐÂY: Đổi tên tiêu đề cho đúng bản chất của trang Phim Sắp Chiếu */}
            <h2 className="title-nowshowing"> Phim Sắp Chiếu </h2>

            <div className="movie-grid">
                {comingSoon.map((movie) => (
                    <MovieCard key={movie.movieId} movie={movie} />
                ))}
            </div>
        </div>
    );
};

export default memo(ComingSoon);