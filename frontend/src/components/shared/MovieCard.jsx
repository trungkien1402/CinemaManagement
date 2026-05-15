import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm dòng này
import '../style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate(); // 2. Khai báo cái "vô lăng" để chuyển trang
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  // 3. Hàm xử lý khi bấm nút
  const handleBooking = () => {
    // Vì trang chủ chưa có phần chọn suất chiếu, mình truyền tạm ST01 và R01 để test sơ đồ ghế
    // Sau này Triển có thể sửa lại để dẫn vào trang Chi tiết phim trước
    const demoShowtimeId = "ST01";
    const demoRoomId = "R01";

    navigate(`/dat-ve/${demoShowtimeId}/${demoRoomId}`);
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
        {/* 4. Gắn hàm vào đây */}
        <button className="btn-book" onClick={handleBooking}>
          Đặt vé
        </button>
      </div>
    </div>
  );
};

export default memo(MovieCard);