import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/MovieSchedule.css';

const MovieSchedule = () => {
  const navigate = useNavigate();

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

  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-04-13');
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: selectedTheater, date: selectedDate }
    })
    .then(res => {
      setShowtimes(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Lỗi lấy danh sách lịch chiếu động:", err);
      setShowtimes([]);
      setLoading(false);
    });
  }, [selectedTheater, selectedDate]);

  const handleTimeSlotClick = (showtimeId) => {
    if (showtimeId) navigate(`/dat-ve/${showtimeId}`);
  };

  if (loading) return <div className="loading-text">Đang tải lịch chiếu từ hệ thống...</div>;

  const safeShowtimes = Array.isArray(showtimes) ? showtimes : [];
  const groupSchedules = {};

  safeShowtimes.forEach(st => {
    if (!st || !st.movie || st.movie.status !== 1) return;

    const mId = st.movie.movieId || st.movie.id;
    if (!mId) return;

    if (!groupSchedules[mId]) {
      groupSchedules[mId] = {
        movie: st.movie,
        theaters: {}
      };
    }

    const tId = st.room?.theater?.theaterId || "T01";
    const tName = st.room?.theater?.name || "Vincom Đồng Khởi";

    if (!groupSchedules[mId].theaters[tId]) {
      groupSchedules[mId].theaters[tId] = {
        theaterName: tName,
        slots: []
      };
    }
    groupSchedules[mId].theaters[tId].slots.push(st);
  });

  const processedMoviesList = Object.values(groupSchedules);

  return (
    <div className="figma-booking-wrapper">
      <div className="figma-container">

        <h1 className="figma-main-title">Lịch Chiếu</h1>
        <p className="figma-sub-title">Chọn rạp và ngày để xem lịch chiếu</p>

        {/* FILTER RẠP */}
        <div className="figma-filter-group">
          <span className="figma-filter-label">📍 Chọn Rạp</span>
          <div className="figma-cinema-row">
            {theatersData.map((theater) => (
              <button
                key={theater.theater_id}
                className={`figma-cinema-btn ${selectedTheater === theater.theater_id ? 'active' : ''}`}
                onClick={() => setSelectedTheater(theater.theater_id)}
              >
                {theater.name}
              </button>
            ))}
          </div>
        </div>

        {/* FILTER NGÀY */}
        <div className="figma-filter-group" style={{ marginTop: '24px' }}>
          <span className="figma-filter-label">📅 Chọn Ngày</span>
          <div className="figma-date-row">
            {datesData.map((dateItem) => (
              <div
                key={dateItem.date}
                className={`figma-date-box ${selectedDate === dateItem.date ? 'active' : ''}`}
                onClick={() => setSelectedDate(dateItem.date)}
              >
                <span className="figma-day-text">{dateItem.day}</span>
                <span className="figma-date-text">{dateItem.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DANH SÁCH LỊCH CHIẾU REAL-TIME */}
        <div className="figma-schedule-list">
          {processedMoviesList.length > 0 ? (
            processedMoviesList.map(({ movie, theaters }) => (
              <div className="figma-movie-card-horizontal" key={movie.movieId}>

                <div className="poster-area" style={{ width: '140px', minWidth: '140px' }}>
                  <img src={movie.image} alt={movie.title} style={{ width: '100%', height: '195px', objectFit: 'cover', borderRadius: '6px' }} />
                </div>

                <div className="figma-info-area">
                  <h2 className="figma-movie-title">{movie.title}</h2>

                  <div className="figma-movie-meta">
                    <span className="figma-star">⭐ 8.5</span>
                    <span>{movie.duration} phút</span>
                    <span>{movie.genre}</span>
                  </div>

                  {Object.values(theaters).map((tData, idx) => (
                    <div key={idx} className="theater-schedule-block" style={{ marginTop: '16px' }}>
                      <div className="figma-cinema-location" style={{ marginBottom: '8px', color: '#ff4d4d', fontWeight: '500' }}>
                        📍 CinemaX {tData.theaterName}
                      </div>

                      <div className="figma-showtime-grid">
                        {tData.slots
                          .slice()
                          // 💡 XỬ LÝ SORT CHUẨN XÁC, KHÔNG BAO GIỜ CRASH
                          .sort((a, b) => {
                            const tA = String(a.startTime || a.start_time || "00:00");
                            const tB = String(b.startTime || b.start_time || "00:00");
                            return tA.localeCompare(tB);
                          })
                          .map((slot) => {
                            // 💡 LẤY THỜI GIAN THEO ĐÚNG BIẾN CỦA SPRING BOOT (startTime)
                            let rawTime = slot.startTime || slot.start_time;
                            let formattedTime = "00:00";

                            if (rawTime) {
                              if (typeof rawTime === 'string') {
                                formattedTime = rawTime.substring(0, 5);
                              } else if (Array.isArray(rawTime) && rawTime.length >= 2) {
                                formattedTime = `${String(rawTime[0]).padStart(2, '0')}:${String(rawTime[1]).padStart(2, '0')}`;
                              }
                            }

                            return (
                              <button
                                key={slot.showtimeId || Math.random()}
                                className="figma-time-slot"
                                onClick={() => handleTimeSlotClick(slot.showtimeId)}
                              >
                                <span className="figma-time-val">{formattedTime}</span>
                                <span className="figma-type-val">2D • Live</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))
          ) : (
            <div className="figma-no-data" style={{ textAlign: 'center', padding: '40px', color: '#6c6c73' }}>
              <p>Rất tiếc, không có lịch chiếu nào phù hợp cho ngày này.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieSchedule;