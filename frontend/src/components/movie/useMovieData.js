import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const useMovieData = (id, datesData) => {
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTheaters, setAllTheaters] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState(datesData[0].date);

  // Lấy danh sách rạp
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

  // Lấy chi tiết phim
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/movies/${id}`)
      .then(res => {
        const movieData = res.data;
        if (movieData && !movieData.trailer) {
          if (String(id) === '1') movieData.trailer = 'M5m4bARNPOw';
          if (String(id) === '2') movieData.trailer = 'uYPbbksxFbY';
          if (String(id) === '3') movieData.trailer = '6ZfuNTqbHE8';
        }
        setMovie(movieData);
      })
      .catch(err => console.error("Lỗi lấy chi tiết phim từ Backend:", err));
  }, [id]);

  // Lấy lịch chiếu theo bộ lọc
  useEffect(() => {
    const theaterQuery = selectedTheater === 'all' && filteredTheaters.length > 0
      ? filteredTheaters.map(t => t.theaterId || t.theater_id || t.id).join(',')
      : selectedTheater;

    axios.get(`http://localhost:8080/api/showtimes/filter`, {
      params: { theaterId: theaterQuery || 'all', date: selectedDate }
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
  }, [id, selectedDate, selectedTheater, filteredTheaters]);
  return {
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
  };
};