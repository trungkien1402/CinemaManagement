import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  const handleBooking = () => {
    // Lấy ID động của phim (Dù là phim gốc hay phim mới thêm)
    const rawId = movie.movieId || movie.id;

    // 💡 SỬA TẠI ĐÂY: Tự động chuẩn hóa chuỗi ID (Ví dụ: ID là 2 -> ST02, ID là 11 -> ST11)
    const showtimeId = movie.showtimeId || `ST${String(rawId).padStart(2, '0')}`;

    // Điều hướng chuẩn sang trang sơ đồ ghế
    navigate(`/dat-ve/${showtimeId}`);
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