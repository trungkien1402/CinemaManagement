import React from 'react';
import '../style/Footer.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-logo-section">
          <div className="logo-wrapper">
            <div className="logo-icon">C</div>
            <span className="brand-name">CinemaX</span>
          </div>
          <p className="slogan">
            {t('footer.slogan')}
          </p>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.movies')}</h3>
          <ul className="footer-list">
            <li>{t('nav.nowShowing')}</li>
            <li>{t('nav.comingSoon')}</li>
            <li>{t('nav.schedule')}</li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.services')}</h3>
          <ul className="footer-list">
            <li>{t('nav.theaters')}</li>
            <li>{t('nav.dropdown.personalAccount')}</li>
            <li>{t('nav.news')}</li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.support')}</h3>
          <ul className="footer-list">
            <li>{t('footer.links.faq')}</li>
            <li>{t('footer.links.hotline')} <span className="hotline-num">1900 xxxx</span></li>
            <li style={{ textTransform: 'lowercase' }}>support@cinemax.vn</li>
          </ul>
        </div>
      </div>

      <div className="copyright-section">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;