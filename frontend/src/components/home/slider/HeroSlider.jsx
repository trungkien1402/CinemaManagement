import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/HeroSlider.css';
import { useTranslation } from 'react-i18next';

const HeroSlider = ({ movies }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // chuyen den slide tiep theo
  const nextSlide = useCallback(() => {
    if (movies && movies.length > 0) {
      setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }
  }, [movies]);

  // quay lai slide truoc
  const prevSlide = useCallback(() => {
    if (movies && movies.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
    }
  }, [movies]);

  // tu dong chuyen slide sau 5 giay
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [movies, nextSlide]);

  // xu ly dat ve nhanh
  const handleQuickBooking = (movieItem) => {
    if (!movieItem) return;
    const event = new CustomEvent('open-booking-modal', { detail: movieItem });
    window.dispatchEvent(event);
  };

  // xem chi tiet phim
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

      {/* nut trai */}
      <button className="hero-arrow hero-arrow-left" onClick={prevSlide} aria-label="Phim trước">
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {/* nut phai */}
      <button className="hero-arrow hero-arrow-right" onClick={nextSlide} aria-label="Phim tiếp theo">
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      {/* phan thong tin phim */}
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
          <span className="meta-item">{movie.genre?.split(',').map(g => t(`genres.${g.trim()}`) || g.trim()).join(', ')}</span>
        </div>

        <div className="hero-slider-actions">
          <button
            className="hero-btn-red"
            onClick={() => handleQuickBooking(movie)}
          >
            {t('home.heroSlider.buttons.bookNow')}
          </button>

          <button
            className="hero-btn-outline"
            onClick={() => handleGoToDetail(movie)}
          >
            {t('home.heroSlider.buttons.detail')}
          </button>
        </div>
      </div>

      {/* slider dot indicators */}
      <div className="hero-slider-dots-container">
        {movies.map((item, idx) => (
          <div
            key={item.movieId || idx}
            className={`hero-dot-bar ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroSlider;