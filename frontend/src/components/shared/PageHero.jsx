import React from 'react';
import '../style/PageHero.css';

const PageHero = ({ title, subtitle, backgroundImage }) => {
  const heroStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <div className="page-hero" style={heroStyle}>
      <div className="page-hero-overlay"></div>
      <div className="page-hero-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHero;
