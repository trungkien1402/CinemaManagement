import React from 'react';
import { Link } from 'react-router-dom';
import '../style/SectionHeader.css';
import { useTranslation } from 'react-i18next';

const SectionHeader = ({ title, subtitle, linkTo }) => {
  const { t } = useTranslation();

  return (
    <div className="section-header-container">
      <div className="header-left">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      
      {linkTo && (
        <Link to={linkTo} className="view-all-link">
          {t('home.shared.sectionHeader.viewAll')} <span className="arrow-icon">&#10095;</span>  <i className="bi bi-chevron-right"></i>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;