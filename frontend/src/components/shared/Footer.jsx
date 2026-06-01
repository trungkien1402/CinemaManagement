import React from 'react';
import '../style/Footer.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; 

const Footer = () => {
  const { t } = useTranslation();

  const handleOpenChat = (e) => {
    e.preventDefault();
    const tawk = window.Tawk_API || globalThis.Tawk_API;
    if (tawk && typeof tawk.maximize === 'function') {
      tawk.maximize();
    } else {
      const iframe = document.querySelector('iframe[title="widget"]');
      if (iframe) {
        iframe.click();
      }
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-logo-section">
          <Link to="/" className="logo-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-wrapper">
              <div className="logo-icon">C</div>
              <span className="brand-name">CinemaX</span>
            </div>
          </Link>
          <p className="slogan">
            {t('footer.slogan')}
          </p>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.movies')}</h3>
          <ul className="footer-list">
            <li><Link to="/dang-chieu">{t('nav.nowShowing')}</Link></li>
            <li><Link to="/sap-chieu">{t('nav.comingSoon')}</Link></li>
            <li><Link to="/lich-chieu">{t('nav.schedule')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.services')}</h3>
          <ul className="footer-list">
            <li><Link to="/rap">{t('nav.theaters')}</Link></li>
            <li><Link to="/ho-so">{t('nav.dropdown.personalAccount')}</Link></li>
            <li><Link to="/tin-tuc">{t('nav.news')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">{t('footer.titles.support')}</h3>
          <ul className="footer-list">
            <li>
              <span 
                onClick={handleOpenChat} 
                style={{ cursor: 'pointer' }}
              >
                {t('footer.links.faq')}
              </span>
            </li>
            <li>
              {t('footer.links.hotline')} <span className="hotline-num">1900 xxxx</span>
            </li>
            <li style={{ textTransform: 'lowercase' }}>
              <a href="mailto:support@cinemax.vn" style={{ color: 'inherit', textDecoration: 'none' }}>support@cinemax.vn</a>
            </li>
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