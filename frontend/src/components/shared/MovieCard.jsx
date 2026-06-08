import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';
import { useTranslation } from 'react-i18next';

const MovieCard = ({ movie }) => {
  const { t } = useTranslation();
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  const navigate = useNavigate();

  const handleOpenModal = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: movie }));
  };

  const handleGoToDetail = (e) => {
    e.preventDefault();
    const id = movie.movieId || movie.id;
    if (id) {
        navigate(`/phim/${id}`);
    } else {
        console.error("Không tìm thấy movieId của bộ phim này:", movie);
    }
  };

  return (
    <div className="movie-card">
      <div className="poster-box" onClick={handleGoToDetail}>
        <img src={image || "https://via.placeholder.com/400x600?text=No+Poster"} alt={title} />

        <div className="poster-info">
          <span>{duration} {t('home.heroSlider.meta.minutes')}</span>
          <span>{year}</span>
        </div>

        {/* lớp phủ kính mờ thanh lịch */}
        <div className="poster-overlay">
          <span className="overlay-text">{t('home.shared.movieCard.viewDetail')}</span>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="title" onClick={handleGoToDetail}>{title}</h3>
        <p className="genre">{genre?.split(',').map(g => t(`genres.${g.trim()}`) || g.trim()).join(', ')}</p>

        {movie.status !== 2 && (
          <button className="btn-book" onClick={handleOpenModal}>
            {t('home.shared.movieCard.bookBtn')}
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(MovieCard);