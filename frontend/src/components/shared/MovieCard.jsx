import React, { memo } from 'react';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  // 💡 PHÁT TÍN HIỆU ĐỂ MỞ MODAL TOÀN CẦU
  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: movie }));
  };

  return (
    <div className="movie-card">
      <div className="poster-box">
        <img src={image || "https://via.placeholder.com/400x600?text=No+Poster"} alt={title} />
        <div className="poster-info">
          <span>{duration} phút</span>
          <span>{year}</span>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="title">{title}</h3>
        <p className="genre">{genre}</p>

        {/* Nút Đặt Vé gọi Modal Toàn Cầu */}
        <button className="btn-book" onClick={handleOpenModal}>
          Đặt vé
        </button>
      </div>
    </div>
  );
};

export default memo(MovieCard);