import '../style/Home.css';
import React, { memo, useEffect, useState } from 'react';
import HeroSlider from './slider/HeroSlider';
import MovieCard from '../shared/MovieCard';
import SectionHeader from '../shared/SectionHeader';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    // State quản lý vị trí xoay tua cho riêng cụm Phim Đang Chiếu
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    // 💡 TÁCH BIỆT DỮ LIỆU: Lọc đúng trạng thái từ Database (1: Đang chiếu, 2: Sắp chiếu)
    const nowShowingMovies = listMovies ? listMovies.filter(movie => movie.status === 1) : [];
    const comingSoonMovies = listMovies ? listMovies.filter(movie => movie.status === 2) : [];

    // Tự động lướt đổi cụm 4 phim Đang Chiếu sau mỗi 5 giây
    useEffect(() => {
        if (nowShowingMovies.length <= 4) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                if (prevIndex + 4 >= nowShowingMovies.length) {
                    return 0;
                }
                return prevIndex + 4;
            });
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(interval);
    }, [nowShowingMovies]);

    if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>{t('home.nowShowing.status.loading')}</div>;

    // Lấy đúng cụm 4 phim Đang Chiếu theo index chạy tự động
    const visibleNowShowing = nowShowingMovies.slice(currentIndex, currentIndex + 4);

    // Lấy tối đa 4 phim Sắp Chiếu hiển thị ở hàng dưới
    const visibleComingSoon = comingSoonMovies.slice(0, 4);

    return (
        <div className="home-page">
            <HeroSlider movies={listMovies} />

            <div className="content-container">

                {/* ================= PHẦN 1: PHIM ĐANG CHIẾU (CÓ HIỆU ỨNG LƯỚT 5 GIÂY) ================= */}
                <SectionHeader
                    title={t('home.nowShowing.title')}
                    subtitle={t('home.nowShowing.subtitle') || "Những bộ phim đang hot nhất hiện nay"}
                    linkTo="/dang-chieu"
                />

                <div className="movie-grid" key={`now-${currentIndex}`} style={{ animation: 'fadeIn 0.5s ease-in-out', marginBottom: '50px' }}>
                    {visibleNowShowing.map((movie) => (
                        <MovieCard key={movie.movieId} movie={movie} />
                    ))}
                </div>


                {/* ================= PHẦN 2: PHIM SẮP CHIẾU (ĐÃ BỔ SUNG KHUNG HIỂN THỊ) ================= */}
                <SectionHeader
                    title={t('home.comingSoon.title')}
                    subtitle={t('home.comingSoon.subtitle') || "Những bộ phim sắp đổ bộ phòng vé"}
                    linkTo="/sap-chieu"
                />

                <div className="movie-grid" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    {visibleComingSoon.length === 0 ? (
                        <div style={{ color: '#aaa', padding: '20px' }}>{t('home.comingSoon.status.empty')}</div>
                    ) : (
                        visibleComingSoon.map((movie) => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default memo(Home);