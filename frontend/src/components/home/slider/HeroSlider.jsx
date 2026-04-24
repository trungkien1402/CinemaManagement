import React, { useState, useEffect, useCallback } from 'react';
import './HeroSlider.css';

const HeroSlider = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  return (
    <div className="hero-slider-main">
  
      <div 
        key={movie.movie_id} 
        className="hero-slide-bg" 
        style={{ backgroundImage: `url(${movie.image})` }}
      >
        <div className="hero-overlay-cinema"></div>
      </div>

      {/* Nội dung chữ gọn gàng */}
      <div className="hero-slider-content" key={`content-${movie.movie_id}`}>
        <div className="hero-slider-tags">
          <span className="hero-tag-status">ĐANG CHIẾU</span>
          <span className="hero-tag-rating">★ 8.2</span>
        </div>

        <h1 className="hero-movie-title">{movie.title}</h1>
        
        <div className="hero-movie-meta">
          <span className="meta-item"><i className="far fa-clock"></i> {movie.duration} phút</span>
          <span className="hero-separator">|</span>
          <span className="meta-item">
            <i className="far fa-calendar-alt"></i> {movie.release_date ? new Date(movie.release_date).getFullYear() : "2026"}
          </span>
          <span className="hero-separator">|</span>
          <span className="meta-item">{movie.genre}</span>
        </div>

        <div className="hero-slider-actions">
          <button className="hero-btn-red">Đặt Vé Ngay</button>
          <button className="hero-btn-outline">Chi Tiết</button>
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