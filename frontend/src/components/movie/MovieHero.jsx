import React from 'react';
import clockIcon from '../../assets/clock.png';
import calendarIcon from '../../assets/calendar.png';
import directorIcon from '../../assets/director.png';
import ticketIcon from '../../assets/movie-ticket.png';
import shareIcon from '../../assets/share.png';
import { useTranslation } from 'react-i18next';

const MovieHero = ({ movie, isFavorite, setIsFavorite, shareText, handleShareMovie, scrollToBooking }) => {
  const { t } = useTranslation();

  return (
    <div
      className="detail-hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), #0a0a0c), url(${movie.image})`
      }}
    >
      <div className="detail-hero-content">
        <span className="detail-badge-status">
          {movie.status === 1 
            ? (t('home.heroSlider.tags.nowShowing') || 'ĐANG CHIẾU') 
            : (t('home.comingSoon.title') || 'SẮP CHIẾU').toUpperCase()}
        </span>

        <h1 className="detail-movie-title">{movie.title}</h1>
        <p className="detail-movie-sub">Mystic Shadows</p>

        <div className="detail-quick-meta">
          <span>
            <img src={clockIcon} alt="" /> {movie.duration} {t('home.heroSlider.meta.minutes') || 'phút'}
          </span>
          <span>
            <img src={calendarIcon} alt="" /> {movie.releaseDate || '2026'}
          </span>
          <span>
            <img src={directorIcon} alt="" /> {t('detail.heroMeta.director') || 'Đạo diễn:'} Nguyễn Minh Tuấn
          </span>
        </div>

        <div className="detail-top-actions">
          {movie.status !== 2 && (
            <button className="detail-btn-red" onClick={scrollToBooking}>
              <img src={ticketIcon} alt="" /> {t('home.heroSlider.buttons.bookNow') || 'Đặt Vé Ngay'}
            </button>
          )}

          <button className="detail-btn-dark" onClick={() => setIsFavorite(!isFavorite)}>
            {isFavorite 
              ? `❤️ ${t('detail.buttons.liked') || 'Đã Thích'}` 
              : `🤍 ${t('detail.buttons.favorite') || 'Yêu Thích'}`}
          </button>

          <button className="detail-btn-dark" onClick={handleShareMovie}>
            {shareText === (t('detail.buttons.share') || 'Chia Sẻ') && <img src={shareIcon} alt="" />}
            {shareText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;