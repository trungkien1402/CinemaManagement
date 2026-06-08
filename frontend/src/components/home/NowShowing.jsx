import MovieCard from '../shared/MovieCard';
import '../style/NowShowing.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHero from '../shared/PageHero';

const NowShowing = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    // Lọc đúng trạng thái từ Database (1: Đang chiếu)
    const nowShowing = listMovies ? listMovies.filter(movie => movie.status === 1) : [];

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>{t('home.nowShowing.status.loading')}</div>;

    return (
        <div className="section-header-nowshowing" style={{ padding: '0 0 40px 0' }}>
            <PageHero 
                title={t('home.nowShowing.title') || "Phim Đang Chiếu"}
                subtitle={t('home.nowShowing.subtitle') || "Khám phá những siêu phẩm điện ảnh đang làm mưa làm gió tại rạp"}
            />

            <div style={{ padding: '0 8%' }}>
                {/* đổi tên class riêng biệt để áp cấu trúc grid 4 cột chuẩn */}
                <div className="movie-grid-layout">
                    {nowShowing.length === 0 ? (
                        <div style={{ color: '#aaa', padding: '20px' }}>{t('home.nowShowing.status.empty')}</div>
                    ) : (
                        nowShowing.map((movie) => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NowShowing;