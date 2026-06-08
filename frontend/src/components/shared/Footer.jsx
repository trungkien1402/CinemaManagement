import React from 'react';
import '../style/Footer.css';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-logo-section">
          <Link to="/" className="logo-wrapper-link" style={{ textDecoration: 'none' }}>
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
            <li><Link to="#">{t('footer.links.faq')}</Link></li>
            <li>
              <a href="tel:1900xxxx">
                {t('footer.links.hotline')} <span className="hotline-num">1900 xxxx</span>
              </a>
            </li>
            <li style={{ textTransform: 'lowercase' }}>
              <a href="mailto:support@cinemax.vn">
                support@cinemax.vn
              </a>
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