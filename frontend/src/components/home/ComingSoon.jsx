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

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Đang tải phim sắp chiếu...</div>;

    // Lọc trạng thái status = 2 kèm kiểm tra mảng tránh lỗi crash
    const comingSoon = listMovies ? listMovies.filter(movie => movie.status === 2) : [];

    return (
        <div className="section-header-nowshowing">
            <h2 className="title-nowshowing">
                Phim Sắp Chiếu
            </h2>

            {/* 💡 Đổi tên class thành movie-grid-layout đồng bộ */}
            <div className="movie-grid-layout">
                {comingSoon.length === 0 ? (
                    <div style={{ color: '#aaa', padding: '20px' }}>Hiện tại chưa có lịch phim sắp chiếu.</div>
                ) : (
                    comingSoon.map((movie) => (
                        <MovieCard key={movie.movieId} movie={movie} />
                    ))
                )}
            </div>
        </div>
    );
};

export default memo(ComingSoon);