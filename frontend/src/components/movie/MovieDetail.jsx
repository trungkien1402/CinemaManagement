import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../style/MovieDetail.css';
import ReviewSection from './ReviewSection';

// Import các components con mới tách
import MovieHero from './MovieHero';
import MovieTrailer from './MovieTrailer';
import MovieSchedule from './MovieSchedule';
// Import custom hook
import { useMovieData } from './useMovieData'; 

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState('Chia Sẻ');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

  const handleReviewsUpdate = (reviewsList) => {
    setTotalReviewCount(reviewsList.length);
    if (!reviewsList || reviewsList.length === 0) {
      setAverageRating(0);
      return;
    }
    const sum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / reviewsList.length;
    setAverageRating((avg * 2).toFixed(1));
  };

  // =========================
  // TẠO DANH SÁCH 7 NGÀY
  // =========================
  const datesData = useMemo(() => {
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const today = new Date();
    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      list.push({
        day: i === 0 ? 'Hôm nay' : daysOfWeek[d.getDay()],
        date: `${yyyy}-${mm}-${dd}`,
        label: `${dd}/${mm}`
      });
    }
    return list;
  }, []);

  // Sử dụng Custom Hook để lấy toàn bộ dữ liệu và logic liên quan API
  const {
    movie,
    showtimes,
    loading,
    uniqueProvinces,
    filteredTheaters,
    selectedProvince,
    selectedTheater,
    selectedDate,
    setSelectedTheater,
    setSelectedDate,
    handleProvinceChange
  } = useMovieData(id, datesData);

  // =========================
  // XỬ LÝ SỰ KIỆN
  // =========================
  const handleShareMovie = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setShareText("✅ Đã Copy Link!");
        setTimeout(() => setShareText("Chia Sẻ"), 2500);
      })
      .catch(err => console.error("Lỗi copy link:", err));
  };

  const scrollToBooking = () => {
    document.getElementById('detail-schedule-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !movie) return <div className="detail-loading">Đang tải thông tin phim...</div>;
  if (!movie) return <div className="detail-loading">Không tìm thấy phim yêu cầu.</div>;

  // =========================
  // PHÂN NHÓM RẠP CHUẨN// =========================
  const theaterGroups = {};
  showtimes.forEach(st => {
    const tId = st.room?.theater?.theaterId || "T01";
    const tName = st.room?.theater?.name || "Rạp chiếu phim";
    const tAddress = st.room?.theater?.location || "";

    if (!theaterGroups[tId]) {
      theaterGroups[tId] = { name: tName, address: tAddress, slots: [] };
    }
    theaterGroups[tId].slots.push(st);
  });

  return (
    <div className="movie-detail-page">
      {/* HERO SECTION */}
      <MovieHero 
        movie={movie}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        shareText={shareText}
        handleShareMovie={handleShareMovie}
        scrollToBooking={scrollToBooking}
      />

      <div className="detail-body-container">
        <div className="detail-main-layout">
          {/* LEFT CONTENT: SYNOPSIS */}
          <div className="detail-left-info">
            <h2 className="detail-section-title">Nội Dung Phim</h2>
            <p className="detail-synopsis">
              {movie.description || 'Một siêu phẩm điện ảnh đầy kịch tính.'}
            </p>

            <div className="detail-meta-block">
              <strong>Thể loại:</strong>
              <div className="detail-genre-tags">
                {movie.genre?.split(',').map((g, idx) => (
                  <span key={idx} className="detail-genre-tag">
                    {g.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-meta-block">
              <strong>Diễn viên:</strong>
              <p>Trần Bảo Sơn, Ngô Thanh Vân, Hồng Ánh</p>
            </div>
          </div>

          {/* RIGHT CONTENT: INFO BOX */}
          <div className="detail-right-box">
            <h3>Thông Tin Phim</h3>
            <div className="right-box-row">
              <span>Thời lượng</span>
              <strong>{movie.duration} phút</strong>
            </div>
            <div className="right-box-row">
              <span>Khởi Chiếu</span>
              <strong>{movie.releaseDate || "16/05/2026"}</strong>
            </div>
            <div className="right-box-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <span>Đánh Giá</span>
                <strong style={{ color: '#ffc107' }}>
                  ⭐ {averageRating > 0 ? `${averageRating}/10` : "Chưa có"}
                </strong>
              </div>
              {totalReviewCount > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>({totalReviewCount} lượt đánh giá)</span>
              )}
            </div>
          </div>
        </div>

        {/* TRAILER SECTION */}
        <MovieTrailer movie={movie} />

        {/* SCHEDULE SECTION */}
        {movie.status !== 2 && (<MovieSchedule 
            datesData={datesData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedProvince={selectedProvince}
            handleProvinceChange={handleProvinceChange}
            uniqueProvinces={uniqueProvinces}
            selectedTheater={selectedTheater}
            setSelectedTheater={setSelectedTheater}
            filteredTheaters={filteredTheaters}
            theaterGroups={theaterGroups}
            navigate={navigate}
          />
        )}

        {/* REVIEW SECTION */}
        <ReviewSection movieId={id} onReviewsUpdate={handleReviewsUpdate} />
      </div>
    </div>
  );
};

export default MovieDetail;