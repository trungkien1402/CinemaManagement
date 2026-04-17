import React from 'react';
import './style/MovieCard.css';

const DEFAULT_IMAGE = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png";

const MovieCard = ({ movie }) => {

  if (!movie) {
    return <div className="movie-card shadow animate-pulse" style={{ height: '400px', backgroundColor: '#222' }}></div>;
  }

  return (
    <div className="movie-card">
      <div className="image-container">
        <img 
          src={movie.image || DEFAULT_IMAGE} 
          alt={movie.title || "CinemaX Movie"} 
          className="movie-poster" 
          onError={(e) => { e.target.src = DEFAULT_IMAGE }} 
        />
        
        <div className="movie-info-overlay">
          <div className="rating-tag">
            <span>★</span> {movie.rating || "N/A"}
          </div>
          <div className="duration-tag">
            <span>🕒</span> {movie.duration || "0"} phút
          </div>
        </div>
      </div>

      <div className="movie-details">
        <span className="movie-title">{movie.title || "Chưa có tiêu đề"}</span>
        <p className="movie-genre">{movie.genre || "Thể loại đang cập nhật"}</p>
        
        <button className="btn-booking">Đặt Vé</button>
      </div>
    </div>
  );
};

export default MovieCard;