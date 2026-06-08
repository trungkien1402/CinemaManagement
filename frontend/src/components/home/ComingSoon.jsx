import MovieCard from '../shared/MovieCard';
import '../style/NowShowing.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHero from '../shared/PageHero';

const ComingSoon = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>{t('home.comingSoon.status.loading')}</div>;

    // Lọc trạng thái status = 2 kèm kiểm tra mảng tránh lỗi crash
    const comingSoon = listMovies ? listMovies.filter(movie => movie.status === 2) : [];

    return (
        <div className="section-header-nowshowing" style={{ padding: '0 0 40px 0' }}>
            <PageHero 
                title={t('home.comingSoon.title') || "Phim Sắp Chiếu"}
                subtitle={t('home.comingSoon.subtitle') || "Đón chờ những dự án bom tấn sắp đổ bộ màn ảnh rộng"}
            />

            <div style={{ padding: '0 8%' }}>
                {/* đổi tên class thành movie-grid-layout đồng bộ */}
                <div className="movie-grid-layout">
                    {comingSoon.length === 0 ? (
                        <div style={{ color: '#aaa', padding: '20px' }}>{t('home.comingSoon.status.empty')}</div>
                    ) : (
                        comingSoon.map((movie) => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(ComingSoon);