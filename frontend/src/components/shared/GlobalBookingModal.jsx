import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/MovieCard.css'; // Dùng chung CSS của thẻ phim luôn

const GlobalBookingModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState(null); // Lưu thông tin phim được chọn

  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-04-13');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const theatersData = [
    { theater_id: 'all', name: 'Tất Cả Rạp' },
    { theater_id: 'T01', name: 'Vincom Đồng Khởi' },
    { theater_id: 'T02', name: 'Landmark 81' },
    { theater_id: 'T03', name: 'Thảo Điền' },
    { theater_id: 'T04', name: 'Times City Hà Nội' },
  ];

  const datesData = [
    { day: 'Thứ 2', date: '2026-04-13', label: '13/4' },
    { day: 'Thứ 3', date: '2026-04-14', label: '14/4' },
    { day: 'Thứ 4', date: '2026-04-15', label: '15/4' },
    { day: 'Thứ 5', date: '2026-04-16', label: '16/4' },
    { day: 'Thứ 6', date: '2026-04-17', label: '17/4' },
  ];

  // 💡 LẮNG NGHE TÍN HIỆU TỪ MOVIE CARD GỬI TỚI
  useEffect(() => {
    const handleOpenModal = (event) => {
      setMovie(event.detail); // Nhận data phim
      setIsOpen(true);        // Mở popup
    };

    window.addEventListener('open-booking-modal', handleOpenModal);
    return () => window.removeEventListener('open-booking-modal', handleOpenModal);
  }, []);

  // Gọi API lấy giờ chiếu mỗi khi thay đổi rạp/ngày
  useEffect(() => {
    if (!isOpen || !movie) return;

    const rawId = movie.movieId || movie.id;
    setLoadingSlots(true);

    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: selectedTheater, date: selectedDate }
    })
    .then(res => {
      const safeData = Array.isArray(res.data) ? res.data : [];
      const movieSlots = safeData.filter(st => st.movie && st.movie.movieId === rawId);
      setSlots(movieSlots);
      setLoadingSlots(false);
    })
    .catch(err => {
      console.error("Lỗi lấy suất chiếu nhanh:", err);
      setSlots([]);
      setLoadingSlots(false);
    });
  }, [isOpen, selectedTheater, selectedDate, movie]);

  const handleTimeSlotClick = (showtimeId) => {
    setIsOpen(false);
    if (showtimeId) navigate(`/dat-ve/${showtimeId}`);
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="quick-modal-overlay">
      <div className="quick-modal-content">

        <button onClick={() => setIsOpen(false)} className="quick-modal-close-btn">&times;</button>

        <h2 className="quick-modal-movie-title">
          Đặt Vé Nhanh: <span style={{color: '#ff4d4d'}}>{movie.title}</span>
        </h2>

        {/* CHỌN RẠP */}
        <div style={{marginBottom: '20px'}}>
          <p className="quick-modal-label">📍 Chọn rạp chiếu:</p>
          <div className="quick-modal-flex-row">
            {theatersData.map(t => (
              <button
                key={t.theater_id}
                className={`quick-modal-chip-btn ${selectedTheater === t.theater_id ? 'active' : ''}`}
                onClick={() => setSelectedTheater(t.theater_id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* CHỌN NGÀY */}
        <div style={{marginBottom: '20px'}}>
          <p className="quick-modal-label">📅 Chọn ngày chiếu:</p>
          <div className="quick-modal-flex-row">
            {datesData.map(d => (
              <button
                key={d.date}
                className={`quick-modal-date-box ${selectedDate === d.date ? 'active' : ''}`}
                onClick={() => setSelectedDate(d.date)}
              >
                <span style={{fontSize: '0.7rem', opacity: 0.6}}>{d.day}</span>
                <span style={{fontSize: '0.95rem', fontWeight: 'bold'}}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* XỔ GIỜ CHIẾU */}
        <div>
          <p className="quick-modal-label">🕒 Khung giờ trống thực tế:</p>
          {loadingSlots ? (
            <div style={{color: '#888', textAlign: 'center', padding: '15px'}}>Đang quét lịch phòng chiếu...</div>
          ) : slots.length > 0 ? (
            <div className="quick-modal-slots-grid">
              {slots
                .slice()
                .sort((a, b) => {
                  const tA = String(a.startTime || a.start_time || "00:00");
                  const tB = String(b.startTime || b.start_time || "00:00");
                  return tA.localeCompare(tB);
                })
                .map(slot => {
                  let rawTime = slot.startTime || slot.start_time;
                  let timeDisplay = "00:00";
                  if (rawTime) {
                    if (typeof rawTime === 'string') {
                      timeDisplay = rawTime.substring(0, 5);
                    } else if (Array.isArray(rawTime) && rawTime.length >= 2) {
                      timeDisplay = `${String(rawTime[0]).padStart(2, '0')}:${String(rawTime[1]).padStart(2, '0')}`;
                    }
                  }
                  const tName = slot.room?.theater?.name || "Rạp";
                  return (
                    <button
                      key={slot.showtimeId || Math.random()}
                      className="quick-modal-time-slot-btn"
                      onClick={() => handleTimeSlotClick(slot.showtimeId)}
                    >
                      <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{timeDisplay}</span>
                      <span style={{fontSize: '0.65rem', color: '#666', marginTop: '2px'}}>{tName.split(' ').pop()}</span>
                    </button>
                  );
                })}
            </div>
          ) : (
            <div style={{color: '#666', textAlign: 'center', padding: '20px', background: '#1c1c20', borderRadius: '8px', fontSize: '0.9rem'}}>
              Rất tiếc, phim không có suất chiếu nào vào ngày và rạp đã chọn.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlobalBookingModal;