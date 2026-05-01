import React from 'react';
import './style/CinemaFilter.css'
const CinemaFilter = ({ theaters, activeId, onSelect }) => {
  return (
    <section className="filter-section">
      <div className="filter-label"> Chọn Rạp</div>
      <div className="pill-group">
        {theaters.map((t) => (
          <button
            key={t.theater_id}
            className={`pill-btn ${activeId === t.theater_id ? 'active' : ''}`}
            onClick={() => onSelect(t.theater_id)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CinemaFilter;