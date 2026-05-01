import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './style/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar-container">
      {/* Logo với hiệu ứng Hover phát sáng */}
      <Link to="/" className="nav-logo">
        <div className="logo-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 3H17V5H19V19H17V21H7V19H5V5H7V3M7 5V7H9V5H7M7 11V13H9V11H7M7 17V19H9V17H7M15 5V7H17V5H15M15 11V13H17V11H15M15 17V19H17V17H15Z" />
          </svg>
        </div>
        <span className="brand-name">Cinema<span className="text-red">X</span></span>
      </Link>

      {/* Danh sách Menu */}
      <ul className="nav-links">
        <li><NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Trang Chủ</NavLink></li>
        <li><NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Đang Chiếu</NavLink></li>
        <li><NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Sắp Chiếu</NavLink></li>
        <li><NavLink to="/lich-chieu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Lịch Chiếu</NavLink></li>
        <li><NavLink to="/rap" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Rạp</NavLink></li>
        <li><NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Tin Tức</NavLink></li>
      </ul>

      {/* Khu vực nút bấm */}
      <div className="nav-actions">
        <Link to="/admin" className="btn-admin">Admin</Link>
        <button className="btn-account">
          <i className="fa-regular fa-user"></i>
          <span>Tài Khoản</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;