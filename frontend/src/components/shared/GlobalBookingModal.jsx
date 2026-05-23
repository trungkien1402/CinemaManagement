import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import axios from 'axios';
import '../style/MovieCard.css';

const GlobalBookingModal = () => {
  const navigate = useNav();
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState(null);

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

  // =======================================================================
  // 💡 GỌI DỮ LIỆU RẠP TỪ API THẬT (DATABASE)
  // =======================================================================
  const [allTheaters, setAllTheaters] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState(datesData[0].date);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/theaters')
      .then(res => setAllTheaters(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Lỗi lấy danh sách rạp:", err));
  }, []);

  // Hàm hỗ trợ tách Tên Tỉnh từ Địa Chỉ (VD: "Q1, Hồ Chí Minh" -> "Hồ Chí Minh")
  // Sửa lại hàm này để bốc đúng cột 'city'
    const getProvince = (theater) => {
      // Ưu tiên cột city (Dữ liệu chuẩn), nếu không có mới lấy tạm location
      return theater.city || theater.location || 'Khác';
    };

  const uniqueProvinces = useMemo(() => {
    return [...new Set(allTheaters.map(getProvince))].filter(Boolean);
  }, [allTheaters]);

  const filteredTheaters = useMemo(() => {
    return allTheaters.filter(t => getProvince(t) === selectedProvince);
  }, [selectedProvince, allTheaters]);

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedTheater('all'); // Reset rạp khi đổi tỉnh
  };
  // =======================================================================

  useEffect(() => {
    const handleOpenModal = (event) => {
      setMovie(event.detail);
      setIsOpen(true);
    };
    window.addEventListener('open-booking-modal', handleOpenModal);
    return () => window.removeEventListener('open-booking-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (!isOpen || !movie) return;
    const rawId = movie.movieId || movie.id;
    setLoadingSlots(true);

    // Gửi ID rạp hoặc danh sách các rạp thuộc Tỉnh đã chọn
    const theaterQuery = selectedTheater === 'all' && filteredTheaters.length > 0
      ? filteredTheaters.map(t => t.theaterId || t.theater_id || t.id).join(',')
      : selectedTheater;

    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: theaterQuery || 'all', date: selectedDate }
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
  }, [isOpen, selectedTheater, selectedDate, movie, filteredTheaters]);

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

        <div style={{marginBottom: '20px'}}>
          <p className="quick-modal-label">📍 Chọn địa điểm:</p>
          <div className="quick-modal-flex-row" style={{ alignItems: 'center' }}>

            <select
                className="filter-select"
                value={selectedProvince}
                onChange={handleProvinceChange}
                style={{ padding: '8px 12px', background: '#222228', color: '#fff', border: '1px solid #33333d', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}
            >
                <option value="">-- Chọn Tỉnh Thành --</option>
                {uniqueProvinces.map((prov, index) => (
                    <option key={index} value={prov}>{prov}</option>
                ))}
            </select>

            <select
                className="filter-select"
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                disabled={!selectedProvince}
                style={{
                    padding: '8px 12px',
                    background: selectedProvince ? '#222228' : '#111115',
                    color: selectedProvince ? '#fff' : '#666',
                    border: '1px solid #33333d',
                    borderRadius: '8px',
                    cursor: selectedProvince ? 'pointer' : 'not-allowed',
                    outline: 'none'
                }}
            >
                {!selectedProvince ? (
                    <option value="all">Vui lòng chọn tỉnh trước</option>
                ) : (
                    <option value="all">-- Tất Cả Rạp --</option>
                )}
                {filteredTheaters.map((theater) => {
                    const tId = theater.theaterId || theater.theater_id || theater.id;
                    return (
                      <option key={tId} value={tId}>{theater.name}</option>
                    );
                })}
            </select>
          </div>
        </div>

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
                    if (typeof rawTime === 'string') timeDisplay = rawTime.substring(0, 5);
                    else if (Array.isArray(rawTime) && rawTime.length >= 2) timeDisplay = `${String(rawTime[0]).padStart(2, '0')}:${String(rawTime[1]).padStart(2, '0')}`;
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
              Rất tiếc, phim không có suất chiếu nào vào thời điểm đã chọn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalBookingModal;