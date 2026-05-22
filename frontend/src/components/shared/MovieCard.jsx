import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  const navigate = useNavigate();

  // 💡 HÀNH ĐỘNG 1: BẤM NÚT ĐẶT VÉ -> HIỆN POPUP ĐẶT VÉ NHANH
  const handleOpenModal = (e) => {
    e.stopPropagation(); // Chặn tuyệt đối không cho click lan ra vùng chi tiết phim ngoài
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: movie }));
  };

  // 💡 HÀNH ĐỘNG 2: CHUYỂN SANG TRANG CHI TIẾT PHIM
  const handleGoToDetail = (e) => {
    // Ép bắt sự kiện chuẩn, không cho các thẻ con nuốt mất click
    e.preventDefault();
    const id = movie.movieId || movie.id;
    if (id) {
        navigate(`/phim/${id}`);
    } else {
        console.error("Không tìm thấy movieId của bộ phim này:", movie);
    }
  };

  return (
    <div className="movie-card" style={{ cursor: 'pointer' }}>

      {/* 💡 GIẢI PHÁP: Bọc riêng khu vực ảnh Poster bằng một thẻ div click riêng biệt,
          đảm bảo click vào giữa ảnh phim là ăn ngay lập tức */}
      <div className="poster-box" onClick={handleGoToDetail}>
        <img src={image || "https://via.placeholder.com/400x600?text=No+Poster"} alt={title} />
        <div className="poster-info">
          <span>{duration} phút</span>
          <span>{year}</span>
        </div>
      </div>

      {/* Phần thông tin chữ phía dưới */}
      <div className="movie-info">
        {/* Click vào tên phim cũng cho xem chi tiết luôn */}
        <h3 className="title" onClick={handleGoToDetail} style={{ cursor: 'pointer' }}>{title}</h3>
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