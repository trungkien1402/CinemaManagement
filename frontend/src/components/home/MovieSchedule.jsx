import React, { useState, useMemo } from 'react';
import './stylepage/MovieSchedule.css';
import CinemaFilter from '../shared/CinemaFilter';
import DateFilter from '../shared/DateFilter';
import MovieScheduleCard from '../shared/MovieScheduleCard';

const MovieSchedule = () => {
  const [selectedTheater, setSelectedTheater] = useState('all');
  const [selectedDate, setSelectedDate] = useState('13/4');

  // 1. Dữ liệu Rạp
  const theatersData = [
    { theater_id: 'all', name: 'Tất Cả Rạp' },
    { theater_id: 'T001', name: 'Vincom Đồng Khởi', city: 'Hồ Chí Minh' },
    { theater_id: 'T002', name: 'Landmark 81', city: 'Hồ Chí Minh' },
    { theater_id: 'T003', name: 'Thảo Điền', city: 'Hồ Chí Minh' },
    { theater_id: 'T004', name: 'Times City Hà Nội', city: 'Hà Nội' },
  ];

  // 2. Dữ liệu Ngày
  const datesData = [
    { day: 'Th 2', date: '13/4' },
    { day: 'Th 3', date: '14/4' },
    { day: 'Th 4', date: '15/4' },
    { day: 'Th 5', date: '16/4' },
    { day: 'Th 6', date: '17/4' },
  ];

  // 3. Dữ liệu mẫu (Giả lập dữ liệu từ API có đầy đủ liên kết)
  const allSchedules = [
    {
      movie: {
        movie_id: 'M001',
        title: 'Bóng Đêm Huyền Bí',
        rating: '8.5',
        duration: 142,
        genre: 'Hành động, Phiêu lưu',
        image: 'https://image.tmdb.org/t/p/original/mBaXZ95O2vS7AyvO6FLPb6GZp4F.jpg',
        author: 'Christopher Nolan'
      },
      theater_id: 'T001', // Thuộc Vincom Đồng Khởi
      date: '13/4',
      showtimes: [
        { time: '10:30', format: '2D', room_number: 1, available_seats: 45, total_seats: 100 },
        { time: '13:15', format: 'IMAX', room_number: 5, available_seats: 32, total_seats: 50 }
      ]
    },
    {
      movie: {
        movie_id: 'M002',
        title: 'Thành Phố Mất Tích',
        rating: '7.2',
        duration: 110,
        genre: 'Hài, Phiêu lưu',
        image: 'https://image.tmdb.org/t/p/original/6S9877YGEp3pS9Z8f6S9.jpg', 
        author: 'Adam Nee'
      },
      theater_id: 'T002', // Thuộc Landmark 81
      date: '14/4',
      showtimes: [
        { time: '16:00', format: '2D', room_number: 2, available_seats: 58, total_seats: 120 }
      ]
    }
    // Bạn có thể thêm nhiều object phim ở các rạp và ngày khác nhau vào đây
  ];

  // 4. Logic Lọc dữ liệu
  // Sử dụng useMemo để tối ưu hiệu năng, chỉ lọc lại khi rạp hoặc ngày thay đổi
  const filteredSchedules = useMemo(() => {
    return allSchedules.filter(item => {
      const matchTheater = selectedTheater === 'all' || item.theater_id === selectedTheater;
      const matchDate = item.date === selectedDate;
      return matchTheater && matchDate;
    });
  }, [selectedTheater, selectedDate]);

  return (
    <div className="booking-wrapper">
      <div className="container">
        <h1 className="main-title">Lịch Chiếu</h1>
        
        <CinemaFilter 
          theaters={theatersData} 
          activeId={selectedTheater} 
          onSelect={setSelectedTheater} 
        />

        <DateFilter 
          dates={datesData} 
          activeDate={selectedDate} 
          onSelect={setSelectedDate} 
        />

        <div className="schedule-list">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item, index) => (
              <MovieScheduleCard 
                key={`${item.movie.movie_id}-${index}`}
                movie={item.movie} 
                showtimes={item.showtimes} 
              />
            ))
          ) : (
            <div className="no-schedule">
              <p>Rất tiếc, không có suất chiếu nào phù hợp với lựa chọn của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieSchedule;