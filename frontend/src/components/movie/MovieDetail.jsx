import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../style/MovieDetail.css';
import ReviewSection from './ReviewSection';

// Import các components con mới tách
import MovieHero from './MovieHero';
import MovieTrailer from './MovieTrailer';
import MovieSchedule from './MovieSchedule';
// Import custom hook
import { useMovieData } from './useMovieData'; 
import { useTranslation } from 'react-i18next';

const MovieDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [shareText, setShareText] = useState(t('detail.buttons.share') || 'Chia Sẻ');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && id) {
      const user = JSON.parse(storedUser);
      const userId = user.id || user.userId;
      axios.get(`http://localhost:8080/api/favorites/check?userId=${userId}&movieId=${id}`)
        .then(res => {
          setIsFavorite(res.data.isFavorite);
        })
        .catch(err => console.error("Lỗi kiểm tra yêu thích:", err));
    } else {
      setIsFavorite(false);
    }
  }, [id]);

  const handleToggleFavorite = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert(t('detail.auth.loginRequired') || 'Vui lòng đăng nhập để thực hiện tính năng này!');
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user.id || user.userId;
    axios.post('http://localhost:8080/api/favorites/toggle', {
      userId: userId,
      movieId: parseInt(id)
    })
    .then(res => {
      setIsFavorite(res.data.isFavorite);
    })
    .catch(err => {
      console.error("Lỗi toggle yêu thích:", err);
    });
  };

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

  const datesData = useMemo(() => {
    const daysOfWeek = [
      t('home.schedule.days.sun') || 'Chủ Nhật',
      t('home.schedule.days.mon') || 'Thứ 2',
      t('home.schedule.days.tue') || 'Thứ 3',
      t('home.schedule.days.wed') || 'Thứ 4',
      t('home.schedule.days.thu') || 'Thứ 5',
      t('home.schedule.days.fri') || 'Thứ 6',
      t('home.schedule.days.sat') || 'Thứ 7'
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
        day: i === 0 ? (t('home.schedule.days.today') || 'Hôm nay') : daysOfWeek[d.getDay()],
        date: `${yyyy}-${mm}-${dd}`,
        label: `${dd}/${mm}`
      });
    }
    return list;
  }, [t]);


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


  const handleShareMovie = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setShareText(t('') || "Đã sao chép");
        setTimeout(() => setShareText(t('detail.buttons.share') || "Chia Sẻ"), 2500);
      })
      .catch(err => console.error("Lỗi copy link:", err));
  };

  const scrollToBooking = () => {
    document.getElementById('detail-schedule-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !movie) return <div className="detail-loading">{t('detail.status.loading') || "Đang tải thông tin phim..."}</div>;
  if (!movie) return <div className="detail-loading">{t('detail.status.notFound') || "Không tìm thấy phim yêu cầu."}</div>;


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
        setIsFavorite={handleToggleFavorite}
        shareText={shareText}
        handleShareMovie={handleShareMovie}
        scrollToBooking={scrollToBooking}
      />

      <div className="detail-body-container">
        <div className="detail-main-layout">
          {/* LEFT CONTENT: SYNOPSIS */}
          <div className="detail-left-info">
            <h2 className="detail-section-title">{t('detail.synopsis.title') || "Nội Dung Phim"}</h2>
            <p className="detail-synopsis">
              {movie.description || t('detail.synopsis.defaultText') || 'Một siêu phẩm điện ảnh đầy kịch tính.'}
            </p>

            <div className="detail-meta-block">
              <strong>{t('detail.info.genre') || "Thể loại:"}</strong>
              <div className="detail-genre-tags">
                {movie.genre?.split(',').map((g, idx) => (
                  <span key={idx} className="detail-genre-tag">
                    {g.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-meta-block">
              <strong>{t('detail.info.cast') || "Diễn viên:"}</strong>
            </div>
          </div>

          {/* RIGHT CONTENT: INFO BOX */}
          <div className="detail-right-box">
            <h3>{t('detail.info.boxTitle') || "Thông Tin Phim"}</h3>
            <div className="right-box-row">
              <span>{t('detail.info.duration') || "Thời lượng"}</span>
              <strong>{movie.duration} {t('home.schedule.movieMeta.minutes') || "phút"}</strong>
            </div>
            <div className="right-box-row">
              <span>{t('detail.info.releaseDate') || "Khởi Chiếu"}</span>
              <strong>{movie.releaseDate || "16/05/2026"}</strong>
            </div>
            <div className="right-box-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('detail.info.rating') || "Đánh Giá"}</span>
                <strong style={{ color: '#ffc107' }}>
                  ⭐ {averageRating > 0 ? `${averageRating}/10` : (t('detail.info.noRating') || "Chưa có")}
                </strong>
              </div>
              {totalReviewCount > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>({totalReviewCount} {t('detail.info.reviewsCount') || "lượt đánh giá"})</span>
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