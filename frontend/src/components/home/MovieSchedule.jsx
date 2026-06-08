import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../style/MovieSchedule.css';
import { useTranslation } from 'react-i18next';
import PageHero from '../shared/PageHero';

const MovieSchedule = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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

  const initialTheater = location.state?.selectedTheaterId || 'all';

  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(initialTheater);
  const [selectedDate, setSelectedDate] = useState(datesData[0].date);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // state mới: chọn tỉnh/thành phố
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:8080/api/theaters')
      .then(res => {
        const dbTheaters = Array.isArray(res.data) ? res.data : [];
        setTheaters([{ theaterId: 'all', name: t('home.schedule.filters.allTheaters') }, ...dbTheaters]);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách rạp làm bộ lọc:", err);
        setTheaters([{ theaterId: 'all', name: t('home.schedule.filters.allTheaters') }]);
      });
  }, [t]);

  useEffect(() => {
    if (location.state?.selectedTheaterId) {
      setSelectedTheater(location.state.selectedTheaterId);
    }
  }, [location.state]);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: selectedTheater, date: selectedDate }
    })
    .then(res => {
      setShowtimes(Array.isArray(res.data) ? res.data : []);
      setLoading(false)
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

  // lọc dữ liệu địa điểm
  const cities = ['all', ...new Set(theaters.map(t => t.city).filter(Boolean))];
  const filteredTheaters = selectedCity === 'all'
    ? theaters
    : theaters.filter(t => t.theaterId === 'all' || t.city === selectedCity);

  // Khi đổi thành phố, tự động nhảy về nút "Tất Cả Rạp" của thành phố đó
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedTheater('all');
  };

  if (loading) return <div className="loading-text">{t('home.schedule.status.loading')}</div>;

  const safeShowtimes = Array.isArray(showtimes) ? showtimes : [];
  const groupSchedules = {};

  // Lọc danh sách suất chiếu theo tỉnh/thành đã chọn
  const filteredShowtimes = safeShowtimes.filter(st => {
    if (selectedCity === 'all') return true;
    return st.room?.theater?.city === selectedCity;
  });

  filteredShowtimes.forEach(st => {
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
    <div className="figma-booking-wrapper" style={{ padding: '0 0 60px 0' }}>
      <PageHero 
        title={t('home.schedule.title') || "Lịch Chiếu Phim"}
        subtitle={t('home.schedule.subtitle') || "Xem lịch chiếu phim nhanh nhất, đặt vé dễ dàng nhất"}
      />
      <div className="figma-container">

        {/* bộ lọc tỉnh/thành và rạp kết hợp (đã fix cú pháp) */}
        <div className="figma-filter-group" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Chọn Tỉnh/Thành */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="figma-filter-label"> {t('home.schedule.filters.cityLabel')}</label>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              style={{ padding: '10px 15px', borderRadius: '8px', background: '#222228', color: '#fff', border: '1px solid #33333d', fontSize: '15px', outline: 'none', cursor: 'pointer', minWidth: '200px' }}
            >
              <option value="all">{t('home.schedule.filters.allCities')}</option>
              {cities.filter(c => c !== 'all').map((city, idx) => (
                <option key={idx} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Chọn Rạp theo Tỉnh/Thành đã lọc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <label className="figma-filter-label">
              <i className="fa-solid fa-location-dot" style={{ color: '#ff2c1f', marginRight: '12px' }}></i> 
              <span>&nbsp;&nbsp;</span>
              {t('home.schedule.filters.theaterLabel')}
            </label>
            <div className="figma-cinema-row">
              {filteredTheaters.map((theater) => {
                const tId = theater.theaterId || theater.theater_id || 'all';
                return (
                  <button
                    key={tId}
                    className={`figma-cinema-btn ${selectedTheater === tId ? 'active' : ''}`}
                    onClick={() => setSelectedTheater(tId)}
                  >
                    {theater.name.startsWith('CinemaX') ? theater.name : `${theater.name}`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Chọn Ngày */}
        <div className="figma-filter-group" style={{ marginTop: '24px' }}>
          <label className="figma-filter-label">
            <i className="fa-regular fa-calendar-days" style={{ color: '#ff2c1f', marginRight: '12px' }}></i> 
            <span>&nbsp;&nbsp;</span>
            {t('home.schedule.filters.dateLabel')}
          </label>

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

        {/* Danh sách phim & lịch chiếu */}
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
                    <span className="figma-star"><i className="fa-solid fa-star" style={{ color: '#ffc107', marginRight: '4px' }}></i>8.5</span>
                    <span>{movie.duration} {t('home.schedule.movieMeta.minutes')}</span>
                    <span>{movie.genre?.split(',').map(g => t(`genres.${g.trim()}`) || g.trim()).join(', ')}</span>
                  </div>

                  {Object.values(theaters).map((tData, idx) => (
                    <div key={idx} className="theater-schedule-block" style={{ marginTop: '16px' }}>
                      <div 
                        className="figma-cinema-location" 
                        style={{ 
                          marginBottom: '8px', 
                          color: '#ff4d4d', 
                          fontWeight: '500',
                          display: 'flex',      
                          alignItems: 'center',  
                          gap: '6px'            
                        }}
                      >
                        <i 
                          className="fa-solid fa-location-dot" 
                          style={{ 
                            color: '#ff2c1f',      
                            marginRight: '4px' 
                          }} 
                        />
                        <span>
                          {tData.theaterName.startsWith('CinemaX') ? tData.theaterName : `CinemaX ${tData.theaterName}`}
                        </span>
                      </div>

                      <div className="figma-showtime-grid">
                        {tData.slots
                          .slice()
                          .sort((a, b) => {
                            const tA = String(a.startTime || a.start_time || "00:00");
                            const tB = String(b.startTime || b.start_time || "00:00");
                            return tA.localeCompare(tB);
                          })
                          .map((slot) => {
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
              <p>{t('home.schedule.status.noData')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MovieSchedule;