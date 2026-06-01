import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 💡 1. IMPORT HOOK ĐIỀU HƯỚNG
import '../../style/HeroSlider.css';
import { useTranslation } from 'react-i18next';

const HeroSlider = ({ movies }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); // 💡 2. KHỞI TẠO HOOK NAVIGATE

  const nextSlide = useCallback(() => {
    if (movies && movies.length > 0) {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }
  }, [movies]);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, movies]);

  // Hàm phát tín hiệu mở Popup Đặt Vé Nhanh
  const handleQuickBooking = (movieItem) => {
    if (!movieItem) return;
    const event = new CustomEvent('open-booking-modal', { detail: movieItem });
    window.dispatchEvent(event);
  };

  // 💡 3. HÀM CHUYỂN SANG TRANG CHI TIẾT PHIM TỪ BANNER TOP
  const handleGoToDetail = (movieItem) => {
    if (!movieItem) return;
    const id = movieItem.movieId || movieItem.id;
    if (id) {
      navigate(`/phim/${id}`);
    }
  };

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  return (
    <div className="hero-slider-main">

      <div
        key={movie.movieId}
        className="hero-slide-bg"
        style={{ backgroundImage: `url(${movie.image})` }}
      >
        <div className="hero-overlay-cinema"></div>
      </div>

      {/* Nội dung chữ gọn gàng */}
      <div className="hero-slider-content" key={`content-${movie.movieId}`}>
        <div className="hero-slider-tags">
          <span className="hero-tag-status">{t('home.heroSlider.tags.nowShowing')}</span>
          <span className="hero-tag-rating">★ 8.2</span>
        </div>

        <h1 className="hero-movie-title">{movie.title}</h1>

        <div className="hero-movie-meta">
          <span className="meta-item"><i className="far fa-clock"></i> {movie.duration} {t('home.heroSlider.meta.minutes')}</span>
          <span className="hero-separator">|</span>
          <span className="meta-item">
            <i className="far fa-calendar-alt"></i> {movie.release_date ? new Date(movie.release_date).getFullYear() : "2026"}
          </span>
          <span className="hero-separator">|</span>
          <span className="meta-item">{movie.genre}</span>
        </div>

        <div className="hero-slider-actions">
          {/* Nút Đặt Vé Ngay giữ nguyên tính năng bật Popup */}
          <button
            className="hero-btn-red"
            onClick={() => handleQuickBooking(movie)}
          >
            {t('home.heroSlider.buttons.bookNow')}
          </button>

          {/* 💡 4. ĐÃ GẮN SỰ KIỆN CLICK VÀO NÚT CHI TIẾT */}
          <button
            className="hero-btn-outline"
            onClick={() => handleGoToDetail(movie)}
          >
            {t('home.heroSlider.buttons.detail')}
          </button>
        </div>
      </div>

      <div className="hero-slider-dots-container">
        {movies.map((_, index) => (
          <div 
            key={index} 
            className={`hero-dot-bar ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;