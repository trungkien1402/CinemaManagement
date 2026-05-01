import React, { memo } from 'react';
import './style/MovieCard.css';

const MovieCard = ({ movie }) => {
  const { title, image, duration, genre, release_date } = movie;
  const year = release_date ? new Date(release_date).getFullYear() : "";

  return (
    <div className="movie-card">
      <div className="poster-box">
        <img src={image || "https://via.placeholder.com/400x600?text=No+Poster"} alt={title} />
        <div className="poster-info">
          <span>{duration} phút</span>
          <span>{year}</span>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="title">{title}</h3>
        <p className="genre">{genre}</p>
        <button className="btn-book">Đặt vé</button>
      </div>
    </div>
  );
};

export default memo(MovieCard);