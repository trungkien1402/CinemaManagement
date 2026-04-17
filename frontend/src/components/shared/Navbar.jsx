import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './style/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar-container">

      <Link to="/" className="nav-logo">
        <div className="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M7 3H17V5H19V19H17V21H7V19H5V5H7V3M7 5V7H9V5H7M7 11V13H9V11H7M7 17V19H9V17H7M15 5V7H17V5H15M15 11V13H17V11H15M15 17V19H17V17H15Z" />
          </svg>
        </div>
        <span className="brand-text">CinemaX</span>
      </Link>

     
      <ul className="nav-links">
        <li><NavLink to="/" className="nav-item">Trang Chủ</NavLink></li>
        <li><NavLink to="/dang-chieu" className="nav-item">Đang Chiếu</NavLink></li>
        <li><NavLink to="/sap-chieu" className="nav-item">Sắp Chiếu</NavLink></li>
        <li><NavLink to="/lich-chieu" className="nav-item">Lịch Chiếu</NavLink></li>
        <li><NavLink to="/rap" className="nav-item">Rạp</NavLink></li>
        <li><NavLink to="/tin-tuc" className="nav-item">Tin Tức</NavLink></li>
        <li><NavLink to="/ho-tro" className="nav-item nav-item-special">Hỗ Trợ</NavLink></li>
      </ul>


      <div className="nav-auth">
        <button className="btn-account">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Tài Khoản
        </button>
      </div>
    </nav>
  );
};

export default Navbar;