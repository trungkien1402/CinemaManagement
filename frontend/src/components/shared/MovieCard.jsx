import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
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
          <span>{duration} phút</span>
          <span>{year}</span>
        </div>

        {/* 💡 LỚP PHỦ KÍNH MỜ THANH LỊCH */}
        <div className="poster-overlay">
          <span className="overlay-text">Xem chi tiết</span>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="title" onClick={handleGoToDetail}>{title}</h3>
        <p className="genre">{genre}</p>

        {movie.status !== 2 && (
          <button className="btn-book" onClick={handleOpenModal}>
            Đặt vé
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(MovieCard);