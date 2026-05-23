import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import calendarIcon from '../../assets/calendar.png';
import ticketIcon from '../../assets/movie-ticket.png';
import shareIcon from '../../assets/share.png';
import directorIcon from '../../assets/director.png';
import clockIcon from '../../assets/clock.png';
import cinemaAddressIcon from '../../assets/cinema address.png';
import playButtonIcon from '../../assets/play-button.png';

import '../style/MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState('Chia Sẻ');

  // =========================
  // TẠO DANH SÁCH 7 NGÀY
  // =========================
  const datesData = useMemo(() => {
    const daysOfWeek = [
      'Chủ Nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7'
    ];

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

  const [selectedDate, setSelectedDate] = useState('');

  // =========================
  // LOAD NGÀY MẶC ĐỊNH
  // =========================
  useEffect(() => {
    if (datesData.length > 0) {
      setSelectedDate(datesData[0].date);
    }
  }, [datesData]);

  // =========================
  // LẤY CHI TIẾT PHIM
  // =========================
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:8080/api/movies/${id}`
        );

        const movieData = res.data;

        // GÁN TRAILER MẶC ĐỊNH
        if (!movieData.trailer) {
          if (String(id) === '1') movieData.trailer = 'M5m4bARNPOw';
          else if (String(id) === '2') movieData.trailer = 'uYPbbksxFbY';
          else if (String(id) === '3') movieData.trailer = '6ZfuNTqbHE8';
        }

        setMovie(movieData);
      } catch (err) {
        console.error('Lỗi lấy chi tiết phim:', err);
      }
    };

    fetchMovie();
  }, [id]);

  // =========================
  // LẤY LỊCH CHIẾU
  // =========================
  useEffect(() => {
    if (!selectedDate) return;

    const fetchShowtimes = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/showtimes/filter',
          {
            params: {
              theaterId: 'all',
              date: selectedDate
            }
          }
        );

        const safeData = Array.isArray(res.data) ? res.data : [];

        const currentMovieShowtimes = safeData.filter((st) => {
          const movieId = st.movie?.movieId || st.movie?.id;
          return String(movieId) === String(id);
        });

        setShowtimes(currentMovieShowtimes);
      } catch (err) {
        console.error('Lỗi lấy lịch chiếu:', err);
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [id, selectedDate]);

  // =========================
  // COPY LINK CHIA SẺ
  // =========================
  const handleShareMovie = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setShareText('✅ Đã Copy Link!');

      setTimeout(() => {
        setShareText('Chia Sẻ');
      }, 2500);
    } catch (err) {
      console.error('Lỗi copy link:', err);
    }
  };

  // =========================
  // SCROLL ĐẾN LỊCH CHIẾU
  // =========================
  const scrollToBooking = () => {
    document
      .getElementById('detail-schedule-section')
      ?.scrollIntoView({
        behavior: 'smooth'
      });
  };

  // =========================
  // LOADING
  // =========================
  if (loading && !movie) {
    return (
      <div className="detail-loading">
        Đang tải thông tin phim...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="detail-loading">
        Không tìm thấy phim yêu cầu.
      </div>
    );
  }

  // =========================
  // GROUP THEATER
  // =========================
  const theaterGroups = {};

  showtimes.forEach((st) => {
    const theaterId =
      st.room?.theater?.theaterId || 'T01';

    const theaterName =
      st.room?.theater?.name || 'Rạp chiếu phim';

    const theaterAddress =
      st.room?.theater?.location || '';

    if (!theaterGroups[theaterId]) {
      theaterGroups[theaterId] = {
        name: theaterName,
        address: theaterAddress,
        slots: []
      };
    }

    theaterGroups[theaterId].slots.push(st);
  });

  return (
    <div className="movie-detail-page">

      {/* HERO */}
      <div
        className="detail-hero"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,0.3), #0a0a0c),
            url(${movie.image})
          `
        }}
      >
        <div className="detail-hero-content">

          <span className="detail-badge-status">
            {movie.status === 1
              ? 'ĐANG CHIẾU'
              : 'SẮP CHIẾU'}
          </span>

          <h1 className="detail-movie-title">
            {movie.title}
          </h1>

          <p className="detail-movie-sub">
            Mystic Shadows
          </p>

          {/* META */}
          <div className="detail-quick-meta">

            <span>
              <img src={clockIcon} alt="" />
              {movie.duration} phút
            </span>

            <span>
              <img src={calendarIcon} alt="" />
              {movie.releaseDate || '2026'}
            </span>

            <span>
              <img src={directorIcon} alt="" />
              Đạo diễn: Nguyễn Minh Tuấn
            </span>

          </div>

          {/* ACTION */}
          <div className="detail-top-actions">

            {movie.status !== 2 && (
              <button
                className="detail-btn-red"
                onClick={scrollToBooking}
              >
                <img src={ticketIcon} alt="" />
                Đặt Vé Ngay
              </button>
            )}

            <button
              className="detail-btn-dark"
              onClick={() =>
                setIsFavorite(!isFavorite)
              }
            >
              {isFavorite ? '❤️' : '🤍'}
              {isFavorite
                ? 'Đã Thích'
                : 'Yêu Thích'}
            </button>

            <button
              className="detail-btn-dark"
              onClick={handleShareMovie}
            >
              {shareText === 'Chia Sẻ' && (
                <img src={shareIcon} alt="" />
              )}

              {shareText}
            </button>

          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="detail-body-container">

        <div className="detail-main-layout">

          {/* LEFT */}
          <div className="detail-left-info">

            <h2 className="detail-section-title">
              Nội Dung Phim
            </h2>

            <p className="detail-synopsis">
              {movie.description ||
                'Một siêu phẩm điện ảnh đầy kịch tính.'}
            </p>

            {/* GENRE */}
            <div className="detail-meta-block">

              <strong>Thể loại:</strong>

              <div className="detail-genre-tags">
                {movie.genre
                  ?.split(',')
                  .map((g, idx) => (
                    <span
                      key={idx}
                      className="detail-genre-tag"
                    >
                      {g.trim()}
                    </span>
                  ))}
              </div>

            </div>

            {/* CAST */}
            <div className="detail-meta-block">

              <strong>Diễn viên:</strong>

              <p>
                Trần Bảo Sơn, Ngô Thanh Vân,
                Hồng Ánh
              </p>

            </div>

          </div>

          {/* RIGHT */}
          <div className="detail-right-box">

            <h3>Thông Tin Phim</h3>

            <div className="right-box-row">
              <span>Thời lượng</span>
              <strong>
                {movie.duration} phút
              </strong>
            </div>

            <div className="right-box-row">
              <span>Khởi Chiếu</span>
              <strong>
                {movie.releaseDate ||
                  '16/05/2026'}
              </strong>
            </div>

            <div className="right-box-row">
              <span>Đánh Giá</span>
              <strong style={{ color: '#ffc107' }}>
                ⭐ 8.5/10
              </strong>
            </div>

          </div>

        </div>

        {/* TRAILER */}
        <div className="detail-trailer-section">

          <h2 className="detail-section-title">
            Trailer Phim
          </h2>

          {movie.trailer ? (
            <div className="detail-video-container">

              <iframe
                src={`https://www.youtube.com/embed/${movie.trailer}`}
                title={movie.title}
                allowFullScreen
              />

            </div>
          ) : (
            <div className="detail-video-placeholder">

              <img
                src={playButtonIcon}
                alt=""
              />

              <span>
                Trailer đang cập nhật...
              </span>

            </div>
          )}

        </div>

        {/* LỊCH CHIẾU */}
        {movie.status !== 2 && (
          <div
            className="detail-schedule-wrapper"
            id="detail-schedule-section"
          >

            <h2 className="detail-main-title">
              Lịch Chiếu
            </h2>

            {/* DATE */}
            <div className="detail-date-row">

              {datesData.map((d) => (
                <div
                  key={d.date}
                  className={`detail-date-box ${
                    selectedDate === d.date
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedDate(d.date)
                  }
                >
                  <span className="detail-day-text">
                    {d.day}
                  </span>

                  <span className="detail-date-text">
                    {d.label}
                  </span>
                </div>
              ))}

            </div>

            {/* THEATER */}
            <div className="detail-theaters-list">

              {Object.keys(theaterGroups).length >
              0 ? (
                Object.values(theaterGroups).map(
                  (theater, idx) => (
                    <div
                      key={idx}
                      className="detail-theater-card-block"
                    >

                      <h3 className="detail-theater-name">
                        CinemaX {theater.name}
                      </h3>

                      <p className="detail-theater-address">

                        <img
                          src={cinemaAddressIcon}
                          alt=""
                        />

                        {theater.address}

                      </p>

                      <div className="detail-slots-grid">

                        {theater.slots
                          .slice()
                          .sort((a, b) =>
                            String(
                              a.startTime
                            ).localeCompare(
                              String(b.startTime)
                            )
                          )
                          .map((slot) => {

                            const rawTime =
                              slot.startTime ||
                              slot.start_time;

                            const formattedTime =
                              typeof rawTime ===
                              'string'
                                ? rawTime.substring(
                                    0,
                                    5
                                  )
                                : '00:00';

                            return (
                              <button
                                key={
                                  slot.showtimeId
                                }
                                className="detail-time-slot-btn"
                                onClick={() =>
                                  navigate(
                                    `/dat-ve/${slot.showtimeId}`
                                  )
                                }
                              >

                                <span className="slot-time">
                                  {formattedTime}
                                </span>

                                <span className="slot-type">
                                  2D • Live
                                </span>

                              </button>
                            );
                          })}

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="detail-no-data">
                  Không có suất chiếu.
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default MovieDetail;