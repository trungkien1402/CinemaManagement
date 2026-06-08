import React from 'react';
import { useTranslation } from 'react-i18next';

const MovieHero = ({ movie, isFavorite, setIsFavorite, shareText, handleShareMovie, scrollToBooking }) => {
  const { t } = useTranslation();

  return (
    <div className="detail-hero">
      {/* Nền mờ ảo ảnh (Ambient backdrop blur) */}
      <div 
        className="detail-hero-backdrop" 
        style={{ backgroundImage: `url(${movie.image})` }}
      ></div>
      <div className="detail-hero-overlay"></div>
      
      <div className="detail-hero-content-wrapper">
        {/* Poster dọc độ nét cao bên trái */}
        <div className="detail-hero-poster">
          <img src={movie.image} alt={movie.title} />
        </div>
        
        {/* Thông tin chi tiết bên phải */}
        <div className="detail-hero-info">
          <span className="detail-badge-status">
            {movie.status === 1 
              ? (t('home.heroSlider.tags.nowShowing') || 'ĐANG CHIẾU') 
              : (t('home.comingSoon.title') || 'SẮP CHIẾU').toUpperCase()}
          </span>

          <h1 className="detail-movie-title">{movie.title}</h1>
          
          <p className="detail-movie-sub">
            {movie.genre?.split(',').map(g => t(`genres.${g.trim()}`) || g.trim()).join(', ') || ''}
          </p>

          <div className="detail-quick-meta">
            <span>
              <i className="fa-regular fa-clock" style={{ marginRight: '6px', color: '#ff2c1f' }}></i> 
              {movie.duration} {t('home.heroSlider.meta.minutes') || 'phút'}
            </span>
            <span>
              <i className="fa-regular fa-calendar-days" style={{ marginRight: '6px', color: '#ff2c1f' }}></i> 
              {movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2026'}
            </span>
            <span>
              <i className="fa-solid fa-user-tie" style={{ marginRight: '6px', color: '#ff2c1f' }}></i> 
              {t('detail.heroMeta.director') || 'Đạo diễn:'} {movie.author || 'Đang cập nhật'}
            </span>
          </div>

          <div className="detail-top-actions">
            {movie.status !== 2 && (
              <button className="detail-btn-red" onClick={scrollToBooking}>
                {t('home.heroSlider.buttons.bookNow') || 'Đặt Vé Ngay'}
              </button>
            )}

            <button className="detail-btn-dark" onClick={() => setIsFavorite(!isFavorite)}>
              {isFavorite 
                ? <><i className="fa-solid fa-heart" style={{ color: '#e50914', marginRight: '6px' }}></i>{t('detail.buttons.liked') || 'Đã Thích'}</>
                : <><i className="fa-regular fa-heart" style={{ marginRight: '6px' }}></i>{t('detail.buttons.favorite') || 'Yêu Thích'}</>}
            </button>

            <button className="detail-btn-dark" onClick={handleShareMovie}>
              <i className="fa-regular fa-share-from-square" style={{ marginRight: '6px' }}></i>
              {shareText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;