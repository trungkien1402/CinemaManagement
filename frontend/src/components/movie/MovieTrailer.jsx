import React from 'react';
import playButtonIcon from '../../assets/play-button.png';

const MovieTrailer = ({ movie }) => {
  return (
    <div className="detail-trailer-section" style={{ margin: '50px 0' }}>
      <h2 className="detail-section-title" style={{ marginBottom: '20px' }}>Trailer Phim</h2>
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
          <span>Trailer đang cập nhật...</span>
        </div>
      )}
    </div>
  );
};

export default MovieTrailer;