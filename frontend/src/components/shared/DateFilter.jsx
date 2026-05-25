import React from 'react';
import '../style/DateFilter.css';
import { useTranslation } from 'react-i18next';

const DateFilter = ({ dates, activeDate, onSelect }) => {
  const { t } = useTranslation();

  return (
    <section className="filter-section">
      <div className="filter-label"> {t('home.shared.dateFilter.label')}</div>
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