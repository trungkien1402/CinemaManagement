import React from 'react';
import  './style/MovieScheduleCard.css';

const MovieScheduleCard = ({ movie, showtimes }) => {
  return (
    <div className="movie-schedule-card">
      <div className="poster-side">
        <img src={movie.image} alt={movie.title} />
      </div>
      
      <div className="info-side">
        <h2 className="movie-title">{movie.title}</h2>
        
        <div className="movie-meta">
          <span className="rating">⭐ {movie.rating || '8.0'}</span>
          <span>{movie.duration} phút</span>
          <span>{movie.genre}</span>
        </div>
        
        <div className="cinema-info">📍 {movie.cinema_name}</div>
        
        <div className="showtime-grid">
          {showtimes.map((s, index) => (
            <button key={index} className="time-slot">
              <span className="time-val">{s.time}</span>
              <span className="type-val">{s.format} • {s.available_seats} ghế</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieScheduleCard;