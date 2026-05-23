import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import cinemaAddressIcon from '../../assets/cinema address.png'; 
import calendarIcon from '../../assets/calendar.png';
import clockIcon from '../../assets/clock.png';
import axios from 'axios';
import '../style/GlobalBookingModal.css';

const GlobalBookingModal = () => {
  const navigate = useNav();
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState(null);

  // 💡 ĐÃ SỬA: Vòng lặp i < 7 để hiển thị FULL 1 TUẦN
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

  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState(datesData[0].date);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const handleOpenModal = (event) => {
      setMovie(event.detail);
      setIsOpen(true);
    };

    window.addEventListener('open-booking-modal', handleOpenModal);
    return () => window.removeEventListener('open-booking-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    axios.get('http://localhost:8080/api/theaters')
      .then(res => {
        const dbTheaters = Array.isArray(res.data) ? res.data : [];
        setTheaters([{ theaterId: 'all', name: 'Tất Cả Rạp' }, ...dbTheaters]);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách rạp:", err);
        setTheaters([{ theaterId: 'all', name: 'Tất Cả Rạp' }]);
      });
  }, [isOpen]);

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

        {/* ================= KHỐI 1: CHỌN RẠP ================= */}
        <div style={{ marginBottom: '20px' }}>
          <span className="figma-filter-label" style={{ marginBottom: '10px' }}>
            <img src={cinemaAddressIcon} alt="Cinema Icon" className="figma-label-icon" /> 
            Chọn rạp chiếu:
          </span>

          <div className="quick-modal-flex-row">
            {theaters.map(t => {
              const tId = t.theaterId || t.theater_id || 'all';
              return (
                <button
                  key={tId}
                  className={`quick-modal-chip-btn ${selectedTheater === tId ? 'active' : ''}`}
                  onClick={() => setSelectedTheater(tId)}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= KHỐI 2: CHỌN NGÀY ================= */}
        <div style={{marginBottom: '20px'}}>
          {/* ✅ ĐÃ SỬA: Đổi sang cấu trúc span có chứa icon calendarIcon */}
          <span className="figma-filter-label" style={{ marginBottom: '10px' }}>
            <img src={calendarIcon} alt="Calendar Icon" className="figma-label-icon" /> 
            Chọn ngày chiếu:
          </span>
          
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

        {/* ================= KHỐI 3: KHUNG GIỜ CHIẾU ================= */}
<div>
  {/* ✅ ĐÃ SỬA: Thay thế emoji bằng thẻ img chứa clockIcon */}
  <span className="figma-filter-label" style={{ marginBottom: '10px' }}>
    <img src={clockIcon} alt="Clock Icon" className="figma-label-icon" /> 
    Khung giờ trống thực tế:
  </span>

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