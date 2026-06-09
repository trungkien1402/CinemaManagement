import '../style/Home.css';
import React, { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from './slider/HeroSlider';
import MovieCard from '../shared/MovieCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    // State quản lý tab đang chọn (phim đang chiếu / phim sắp chiếu)
    const [activeTab, setActiveTab] = useState('nowShowing');

    // State quản lý vị trí xoay tua cho cụm Phim Đang Chiếu và Phim Sắp Chiếu
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentComingSoonIndex, setCurrentComingSoonIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(8);

    // Tính toán số lượng phim hiển thị theo chiều rộng màn hình để lấp đầy khoảng trống
    useEffect(() => {
        const updateCount = () => {
            const width = window.innerWidth;
            if (width > 1200) {
                setVisibleCount(8); // Desktop (4 cột -> hiển thị 8 phim để đầy 2 hàng)
            } else if (width > 768) {
                setVisibleCount(6); // Tablet (3 cột -> hiển thị 6 phim để đầy 2 hàng)
            } else {
                setVisibleCount(4); // Mobile (2 cột -> hiển thị 4 phim để đầy 2 hàng)
            }
        };
        updateCount();
        window.addEventListener('resize', updateCount);
        return () => window.removeEventListener('resize', updateCount);
    }, []);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    // tách biệt dữ liệu: lọc đúng trạng thái từ database (1: đang chiếu, 2: sắp chiếu)
    const nowShowingMovies = listMovies ? listMovies.filter(movie => movie.status === 1) : [];
    const comingSoonMovies = listMovies ? listMovies.filter(movie => movie.status === 2) : [];

    // Tự động lướt đổi cụm phim Đang Chiếu sau mỗi 5 giây
    useEffect(() => {
        if (nowShowingMovies.length <= visibleCount || activeTab !== 'nowShowing') return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                if (prevIndex + visibleCount >= nowShowingMovies.length) {
                    return 0;
                }
                return prevIndex + visibleCount;
            });
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(interval);
    }, [nowShowingMovies, activeTab, visibleCount]);

    // Tự động lướt đổi cụm phim Sắp Chiếu sau mỗi 5 giây
    useEffect(() => {
        if (comingSoonMovies.length <= visibleCount || activeTab !== 'comingSoon') return;

        const interval = setInterval(() => {
            setCurrentComingSoonIndex((prevIndex) => {
                if (prevIndex + visibleCount >= comingSoonMovies.length) {
                    return 0;
                }
                return prevIndex + visibleCount;
            });
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(interval);
    }, [comingSoonMovies, activeTab, visibleCount]);

    if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>{t('home.nowShowing.status.loading')}</div>;

    // Lấy cụm phim Đang Chiếu theo index và số lượng hiển thị tự động
    const visibleNowShowing = nowShowingMovies.slice(currentIndex, currentIndex + visibleCount);

    // Lấy cụm phim Sắp Chiếu theo index và số lượng hiển thị tự động
    const visibleComingSoon = comingSoonMovies.slice(currentComingSoonIndex, currentComingSoonIndex + visibleCount);

    return (
        <div className="home-page">
            <HeroSlider movies={listMovies} />

            <div className="content-container">
                <div className="home-tabs-header">
                    <div className="tabs-left">
                        <div className="tabs-buttons">
                            <button 
                                className={`tab-btn ${activeTab === 'nowShowing' ? 'active' : ''}`}
                                onClick={() => setActiveTab('nowShowing')}
                            >
                                {t('home.nowShowing.title')}
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'comingSoon' ? 'active' : ''}`}
                                onClick={() => setActiveTab('comingSoon')}
                            >
                                {t('home.comingSoon.title')}
                            </button>
                        </div>
                        <p className="tab-subtitle">
                            {activeTab === 'nowShowing' 
                                ? (t('home.nowShowing.subtitle') || "Những bộ phim đang hot nhất hiện nay")
                                : (t('home.comingSoon.subtitle') || "Những bộ phim sắp đổ bộ phòng vé")
                            }
                        </p>
                    </div>
                    
                    <Link to={activeTab === 'nowShowing' ? "/dang-chieu" : "/sap-chieu"} className="view-all-link">
                        {t('home.shared.sectionHeader.viewAll') || "Xem tất cả"} <span className="arrow-icon">&#10095;</span>
                    </Link>
                </div>

                {activeTab === 'nowShowing' ? (
                    <div className="movie-grid" key={`now-${currentIndex}`} style={{ animation: 'fadeIn 0.5s ease-in-out', marginBottom: '50px' }}>
                        {visibleNowShowing.map((movie) => (
                            <MovieCard key={movie.movieId} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="movie-grid" key={`coming-${currentComingSoonIndex}`} style={{ animation: 'fadeIn 0.5s ease-in-out', marginBottom: '50px' }}>
                        {visibleComingSoon.length === 0 ? (
                            <div style={{ color: '#aaa', padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>
                                {t('home.comingSoon.status.empty') || "Không có phim nào sắp chiếu"}
                            </div>
                        ) : (
                            visibleComingSoon.map((movie) => (
                                <MovieCard key={movie.movieId} movie={movie} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(Home);