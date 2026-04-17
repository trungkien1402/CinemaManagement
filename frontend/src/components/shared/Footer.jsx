import React from 'react';
import './style/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        

        <div className="footer-logo-section">
          <div className="logo-wrapper">
            <div className="logo-icon">C</div>
            <span className="brand-name">CinemaX</span>
          </div>
          <p className="slogan">
            Trải nghiệm điện ảnh đẳng cấp với công nghệ hiện đại nhất
          </p>
        </div>


        <div>
          <h3 className="footer-title">Phim</h3>
          <ul className="footer-list">
            <li>Đang Chiếu</li>
            <li>Sắp Chiếu</li>
            <li>Lịch Chiếu</li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">Dịch Vụ</h3>
          <ul className="footer-list">
            <li>Hệ Thống Rạp</li>
            <li>Tài Khoản</li>
            <li>Tin Tức</li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">Hỗ Trợ</h3>
          <ul className="footer-list">
            <li>Câu Hỏi Thường Gặp</li>
            <li>Hotline: <span className="hotline-num">1900 xxxx</span></li>
            <li style={{ textTransform: 'lowercase' }}>support@cinemax.vn</li>
          </ul>
        </div>
      </div>

      <div className="copyright-section">
        <p>© 2026 CinemaX. Bản quyền thuộc về CinemaX.</p>
      </div>
    </footer>
  );
};

export default Footer;