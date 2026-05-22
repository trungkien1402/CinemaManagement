import MovieCard from '../shared/MovieCard';
import '../style/NowShowing.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import React, { useEffect } from 'react';

const NowShowing = () => {
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    // Lọc đúng trạng thái từ Database (1: Đang chiếu)
    const nowShowing = listMovies ? listMovies.filter(movie => movie.status === 1) : [];

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Đang tải phim đang chiếu...</div>;

    return (
        <div className="section-header-nowshowing">
            <h2 className="title-nowshowing">
                Phim Đang Chiếu
            </h2>

            {/* 💡 Đổi tên class riêng biệt để áp cấu trúc grid 4 cột chuẩn */}
            <div className="movie-grid-layout">
                {nowShowing.length === 0 ? (
                    <div style={{ color: '#aaa', padding: '20px' }}>Hiện tại chưa có lịch phim đang chiếu.</div>
                ) : (
                    nowShowing.map((movie) => (
                        <MovieCard key={movie.movieId} movie={movie} />
                    ))
                )}
            </div>
        </div>
    );
};

export default NowShowing;