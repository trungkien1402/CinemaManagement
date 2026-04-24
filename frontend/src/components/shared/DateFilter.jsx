import React from 'react';
import './style/DateFilter.css'
const DateFilter = ({ dates, activeDate, onSelect }) => {
  return (
    <section className="filter-section">
      <div className="filter-label"> Chọn Ngày</div>
      <div className="date-group">
        {dates.map((d) => (
          <button
            key={d.date}
            className={`date-card ${activeDate === d.date ? 'active' : ''}`}
            onClick={() => onSelect(d.date)}
          >
            <span className="day-text">{d.day}</span>
            <span className="date-text">{d.date}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default DateFilter;