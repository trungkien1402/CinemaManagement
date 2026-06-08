import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import axios from 'axios';

import '../style/GlobalBookingModal.css';
import { useTranslation } from 'react-i18next';

const GlobalBookingModal = () => {
  const { t } = useTranslation();
  const navigate = useNav();
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState(null);

  const datesData = useMemo(() => {
    const daysOfWeek = [
      t('home.schedule.days.sun'),
      t('home.schedule.days.mon'),
      t('home.schedule.days.tue'),
      t('home.schedule.days.wed'),
      t('home.schedule.days.thu'),
      t('home.schedule.days.fri'),
      t('home.schedule.days.sat')
    ];
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      list.push({
        day: i === 0 ? t('home.schedule.days.today') : daysOfWeek[d.getDay()],
        date: `${yyyy}-${mm}-${dd}`,
        label: `${d.getDate()}/${d.getMonth() + 1}`
      });
    }
    return list;
  }, [t]);

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

  const getProvince = (theater) => {
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
    setSelectedTheater('all');
  };

  useEffect(() => {
    const handleOpenModal = (event) => {
      setMovie(event.detail);
      setIsOpen(true);
    };
    window.addEventListener('open-booking-modal', handleOpenModal);
    return () => window.removeEventListener('open-booking-modal', handleOpenModal);
  }, []);

  // =======================================================================
  // gửi chuỗi chứa các rạp xuống cho backend lọc thẳng từ database
  // =======================================================================
  useEffect(() => {
    if (!isOpen || !movie) return;
    const rawId = movie.movieId || movie.id;
    setLoadingSlots(true);

    // Xử lý tạo Query để ném xuống Backend
    let queryTheaterId = selectedTheater;
    if (selectedTheater === 'all') {
        if (selectedProvince && filteredTheaters.length > 0) {
            // Gom tất cả ID Rạp của Tỉnh được chọn lại thành chuỗi "R01,R02,R03"
            queryTheaterId = filteredTheaters.map(t => t.theaterId || t.theater_id || t.id).join(',');
        } else {
            // Nếu không chọn tỉnh nào, lấy tất cả trên toàn quốc
            queryTheaterId = 'all';
        }
    }

    // Nếu có chọn Tỉnh mà tỉnh đó trống trơn không có rạp, thì bỏ qua không gọi API
    if (selectedProvince && filteredTheaters.length === 0) {
        setSlots([]);
        setLoadingSlots(false);
        return;
    }

    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: queryTheaterId, date: selectedDate }
    })
    .then(res => {
      const safeData = Array.isArray(res.data) ? res.data : [];
      // Backend đã trả về list suất chiếu đúng rạp, Frontend chỉ việc lọc ra bộ phim hiện tại
      const movieSlots = safeData.filter(st => st.movie && String(st.movie.movieId || st.movie.id) === String(rawId));
      setSlots(movieSlots);
      setLoadingSlots(false);
    })
    .catch(err => {
      console.error("Lỗi lấy suất chiếu nhanh:", err);
      setSlots([]);
      setLoadingSlots(false);
    });
  }, [isOpen, selectedTheater, selectedDate, movie, filteredTheaters, selectedProvince]);

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
          {t('detail.quickModal.title')} <span style={{color: '#ff4d4d'}}>{movie.title}</span>
        </h2>

        <div style={{marginBottom: '20px'}}>
          <label className="figma-filter-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
            <i className="fa-solid fa-location-dot" style={{ color: '#ff2c1f', fontSize: '16px', marginRight: '12px' }}></i>
            <span>&nbsp;&nbsp;</span>
            {t('detail.quickModal.labels.selectTheater')}
          </label>

          <div className="quick-modal-flex-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="filter-select"
              value={selectedProvince}
              onChange={handleProvinceChange}
              style={{ padding: '8px 12px', background: '#222228', color: '#fff', border: '1px solid #33333d', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">{t('detail.schedule.selectProvince')}</option>
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
                <option value="all">{t('detail.schedule.selectProvinceFirst')}</option>
              ) : (
                <option value="all">{t('home.schedule.filters.allTheaters')}</option>
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
          <label className="figma-filter-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
            <i className="fa-regular fa-calendar-days" style={{ color: '#ff2c1f', fontSize: '16px', marginRight: '12px' }}></i>
            <span>&nbsp;&nbsp;</span>
            {t('detail.quickModal.labels.selectDate')}
          </label>

          <div className="quick-modal-flex-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {datesData.map(d => (
              <button
                key={d.date}
                className={`quick-modal-date-box ${selectedDate === d.date ? 'active' : ''}`}
                onClick={() => setSelectedDate(d.date)}
                style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', borderRadius: '8px', border: '1px solid #33333d', cursor: 'pointer', alignItems: 'center' }}
              >
                <span style={{fontSize: '0.7rem', opacity: 0.6}}>{d.day}</span>
                <span style={{fontSize: '0.95rem', fontWeight: 'bold'}}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="figma-filter-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
            <i className="fa-regular fa-clock" style={{ color: '#ff2c1f', fontSize: '16px', marginRight: '12px' }}></i> 
            <span>&nbsp;&nbsp;</span>
            {t('detail.quickModal.labels.availableSlots')}
          </label>

          {loadingSlots ? (
            <div style={{color: '#888', textAlign: 'center', padding: '15px'}}>{t('detail.quickModal.status.scanning')}</div>
          ) : slots.length > 0 ? (
            <div className="quick-modal-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
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
              {t('detail.schedule.noData')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlobalBookingModal;