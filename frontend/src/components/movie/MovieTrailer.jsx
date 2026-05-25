import React from 'react';
import playButtonIcon from '../../assets/play-button.png';
import { useTranslation } from 'react-i18next';

const MovieTrailer = ({ movie }) => {
  const { t } = useTranslation();

  return (
    <div className="detail-trailer-section" style={{ margin: '50px 0' }}>
      <h2 className="detail-section-title" style={{ marginBottom: '20px' }}>
        {t('detail.trailer.title') || "Trailer Phim"}
      </h2>
      {movie.trailer ? (
        <div className="detail-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${movie.trailer}`}
            title={movie.title}
            allowFullScreen
          />
        </div>
      ) : (
        <div className="detail-video-placeholder">
          <img src={playButtonIcon} alt="" />
          <span>{t('detail.trailer.updating') || "Trailer đang cập nhật..."}</span>
        </div>
      )}
    </div>
  );
};

export default MovieTrailer;