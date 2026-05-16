import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  const handleBooking = () => {
    // Tự động sinh mã suất chiếu khớp với ID phim (ST01, ST02, ST03, ST04)
    const showtimeId = movie.showtimeId || `ST0${movie.movieId}`;

    // SỬA Ở ĐÂY: Thêm lại /R01 ở cuối để khớp khít với khai báo Route cũ trong App.jsx (/:showtimeId/:roomId)
    navigate(`/dat-ve/${showtimeId}/R01`);
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
        <button className="btn-book" onClick={handleBooking}>
          Đặt vé
        </button>
      </div>
    </div>
  );
};

export default memo(MovieCard);