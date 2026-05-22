import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/MovieDetail.css';
import ReviewSection from './ReviewSection'; // 💡 IMPORT COMPONENT BÌNH LUẬN

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quản lý trạng thái tương tác nút Yêu Thích & Chia Sẻ
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState("🔗 Chia Sẻ");

  // 💡 1. STATE LƯU ĐIỂM ĐÁNH GIÁ TRUNG BÌNH CỦA PHIM VÀ TỔNG SỐ LƯỢT
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

  // 💡 2. HÀM NHẬN DỮ LIỆU TỪ REVIEW SECTION VÀ TÍNH TOÁN
  const handleReviewsUpdate = (reviewsList) => {
    setTotalReviewCount(reviewsList.length);
    if (!reviewsList || reviewsList.length === 0) {
      setAverageRating(0);
      return;
    }
    // Tính tổng số sao (thang 5)
    const sum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    // Tính trung bình (trên thang 5)
    const avg = sum / reviewsList.length;
    // Nhân 2 để ra thang điểm 10, làm tròn 1 chữ số thập phân
    setAverageRating((avg * 2).toFixed(1));
  };

  // trailer theo id
  if (movie && !movie.trailer) {
    if (String(id) === '1') movie.trailer = 'M5m4bARNPOw';
    if (String(id) === '2') movie.trailer = 'uYPbbksxFbY';
    if (String(id) === '3') movie.trailer = '6ZfuNTqbHE8';
  }

  // Thuật toán tự động tính lịch 7 ngày (Full tuần) cho cụm đặt vé
  const datesData = useMemo(() => {
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const list = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');

      list.push({
        day: i === 0 ? 'Hôm nay' : daysOfWeek[d.getDay()],
        date: `${yyyy}-${mm}-${dd}`,
        label: `${d.getDate()}/${d.getMonth() + 1}`
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(datesData[0].date);

  // Gọi API lấy thông tin chi tiết bộ phim
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/movies/${id}`)
      .then(res => {
        setMovie(res.data);
      })
      .catch(err => {
        console.error("Lỗi lấy chi tiết phim từ Backend:", err);
      });
  }, [id]);

  // Gọi API lấy lịch chiếu động dựa theo ngày được chọn
  useEffect(() => {
    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: 'all', date: selectedDate }
    })
    .then(res => {
      const safeData = Array.isArray(res.data) ? res.data : [];
      const currentMovieShowtimes = safeData.filter(st => {
        const mId = st.movie?.movieId || st.movie?.id;
        return String(mId) === String(id);
      });
      setShowtimes(currentMovieShowtimes);
      setLoading(false);
    })
    .catch(err => {
      console.error("Lỗi lấy lịch chiếu cho trang chi tiết:", err);
      setShowtimes([]);
      setLoading(false);
    });
  }, [id, selectedDate]);

  // Hàm copy đường link URL chia sẻ phim vào bộ nhớ máy tính
  const handleShareMovie = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setShareText("✅ Đã Copy Link!");
        setTimeout(() => setShareText("🔗 Chia Sẻ"), 2500);
      })
      .catch(err => console.error("Lỗi copy link:", err));
  };

  // Cuộn mượt mà xuống khu vực chọn suất chiếu khi bấm nút Đặt Vé
  const scrollToBooking = () => {
    document.getElementById('detail-schedule-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !movie) return <div className="detail-loading">Đang tải thông tin phim...</div>;
  if (!movie) return <div className="detail-loading">Không tìm thấy phim yêu cầu.</div>;

  // Nhóm lịch chiếu theo từng rạp cụ thể
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
      {/* 1. KHU VỰC HERO BANNER TOP */}
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), #0a0a0c), url(${movie.image})` }}>
        <div className="detail-hero-content">
          <span className="detail-badge-status">{movie.status === 1 ? "ĐANG CHIẾU" : "SẮP CHIẾU"}</span>
          <h1 className="detail-movie-title">{movie.title}</h1>
          <p className="detail-movie-sub">Mystic Shadows</p>

          <div className="detail-quick-meta">
            <span>🕒 {movie.duration} phút</span>
            <span>📅 {movie.releaseDate || movie.release_date || "2026"}</span>
            <span>👤 Đạo diễn: Nguyễn Minh Tuấn</span>
          </div>

          <div className="detail-top-actions">
            {movie.status !== 2 && (
              <button className="detail-btn-red" onClick={scrollToBooking}>🎟️ Đặt Vé Ngay</button>
            )}

            <button
              className="detail-btn-dark"
              onClick={() => setIsFavorite(!isFavorite)}
              style={{ color: isFavorite ? '#ff3355' : 'white', transition: 'all 0.3s ease' }}
            >
              {isFavorite ? "❤️ Đã Thích" : "🤍 Yêu Thích"}
            </button>

            <button className="detail-btn-dark" onClick={handleShareMovie}>
              {shareText}
            </button>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC THÔNG TIN CHI TIẾT & TRAILER VIDEO */}
      <div className="detail-body-container">
        <div className="detail-main-layout">
          <div className="detail-left-info">
            <h2 className="detail-section-title">Nội Dung Phim</h2>
            <p className="detail-synopsis">
              {movie.description || "Một siêu phẩm điện ảnh đầy kịch tính với những kỹ xảo hoành tráng và nội dung lôi cuốn, hứa hẹn sẽ mang đến cho khán giả những trải nghiệm điện ảnh đỉnh cao bùng nổ phòng vé."}
            </p>

            <div className="detail-meta-block">
              <strong>Thể loại:</strong>
              <div className="detail-genre-tags">
                {movie.genre?.split(',').map((g, idx) => (
                  <span key={idx} className="detail-genre-tag">{g.trim()}</span>
                ))}
              </div>
            </div>

            <div className="detail-meta-block" style={{marginTop: '15px'}}>
              <strong>Diễn viên:</strong>
              <p style={{color: '#ccc', marginTop: '5px'}}>Trần Bảo Sơn, Ngô Thanh Vân, Hồng Ánh</p>
            </div>
          </div>

          <div className="detail-right-box">
            <h3>Thông Tin Phim</h3>
            <div className="right-box-row"><span>Thời lượng</span><strong>{movie.duration} phút</strong></div>
            <div className="right-box-row"><span>Khởi Chiếu</span><strong>{movie.releaseDate || "16/05/2026"}</strong></div>

            {/* 💡 3. KHU VỰC ĐIỂM ĐÁNH GIÁ ĐÃ ĐƯỢC CẬP NHẬT ĐỘNG */}
            <div className="right-box-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Đánh Giá</span>
                    <strong style={{color: '#ffc107'}}>
                        ⭐ {averageRating > 0 ? `${averageRating}/10` : "Chưa có"}
                    </strong>
                </div>
                {totalReviewCount > 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>({totalReviewCount} lượt đánh giá)</span>
                )}
            </div>
          </div>
        </div>

        {/* 🎬 KHU VỰC PHÁT TRAILER YOUTUBE TỰ ĐỘNG KHÍT KHUNG 16:9 */}
        <div className="detail-trailer-section" style={{ margin: '50px 0' }}>
          <h2 className="detail-section-title" style={{ marginBottom: '20px' }}>Trailer Phim</h2>

          {movie.trailer ? (
            <div className="detail-video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #2a2a35' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube.com/embed/${movie.trailer}?rel=0&modestbranding=1`}
                title={`Trailer - ${movie.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="detail-video-placeholder" style={{ background: '#1c1c24', height: '350px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', border: '1px solid #333' }}>
              <div className="play-icon-center" style={{ fontSize: '3rem', color: '#ff3333' }}>▶️</div>
              <span style={{ color: '#aaa' }}>Trailer của bộ phim này đang được cập nhật...</span>
            </div>
          )}
        </div>

        {/* 3. KHU VỰC LỊCH CHIẾU ĐỘNG DƯỚI ĐÁY */}
        {movie.status !== 2 && (
          <div className="detail-schedule-wrapper" id="detail-schedule-section">
            <h2 className="detail-main-title">Lịch Chiếu</h2>

            <div className="detail-date-row">
              {datesData.map((d) => (
                <div
                  key={d.date}
                  className={`detail-date-box ${selectedDate === d.date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(d.date)}
                >
                  <span className="detail-day-text">{d.day}</span>
                  <span className="detail-date-text">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="detail-theaters-list">
              {Object.keys(theaterGroups).length > 0 ? (
                Object.values(theaterGroups).map((theater, idx) => (
                  <div className="detail-theater-card-block" key={idx}>
                    <h3 className="detail-theater-name">CinemaX {theater.name}</h3>
                    <p className="detail-theater-address">📍 {theater.address || "Địa chỉ rạp chiếu phim"}</p>

                    <div className="detail-slots-grid">
                      {theater.slots
                        .slice()
                        .sort((a, b) => String(a.startTime || a.start_time).localeCompare(String(b.startTime || b.start_time)))
                        .map((slot) => {
                          let rawTime = slot.startTime || slot.start_time;
                          let formattedTime = "00:00";
                          if (typeof rawTime === 'string') formattedTime = rawTime.substring(0, 5);

                          return (
                            <button
                              key={slot.showtimeId}
                              className="detail-time-slot-btn"
                              onClick={() => navigate(`/dat-ve/${slot.showtimeId}`)}
                            >
                              <span className="slot-time">{formattedTime}</span>
                              <span className="slot-type">2D • Live</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="detail-no-data">Rất tiếc, phim không có suất chiếu nào vào ngày đã chọn.</div>
              )}
            </div>
          </div>
        )}

        {/* 💡 4. TRUYỀN HÀM XUỐNG COMPONENT CON */}
        <ReviewSection movieId={id} onReviewsUpdate={handleReviewsUpdate} />

      </div>
    </div>
  );
};

export default MovieDetail;