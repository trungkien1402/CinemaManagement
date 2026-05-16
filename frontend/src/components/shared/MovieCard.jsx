import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  // Lấy thêm thuộc tính status từ dữ liệu movie gửi sang
  const { title, image, duration, genre, release_date, status } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  const handleBooking = () => {
    const rawId = movie.movieId || movie.id;
    const showtimeId = movie.showtimeId || `ST${String(rawId).padStart(2, '0')}`;
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

        {/* 💡 XỬ LÝ ĐIỀU KIỆN: Nếu status !== 2 (Không phải phim sắp chiếu) thì mới hiện nút Đặt vé */}
        {status !== 2 && (
          <button className="btn-book" onClick={handleBooking}>
            Đặt vé
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(MovieCard);