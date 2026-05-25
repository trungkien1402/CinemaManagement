import React from 'react';
import '../style/CinemaFilter.css';
import { useTranslation } from 'react-i18next';

const CinemaFilter = ({ theaters, activeId, onSelect }) => {
  const { t } = useTranslation();

  return (
    <section className="filter-section">
      <div className="filter-label"> {t('home.shared.cinemaFilter.label')}</div>
      <div className="pill-group">
        {theaters.map((tItem) => (
          <button
            key={tItem.theater_id}
            className={`pill-btn ${activeId === tItem.theater_id ? 'active' : ''}`}
            onClick={() => onSelect(tItem.theater_id)}
          >
            {tItem.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CinemaFilter;