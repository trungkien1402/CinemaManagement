import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthModal from '../auth/AuthModal'; 
import LanguageSwitcher from './LanguageSwitcher'; 
import '../style/Navbar.css';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    // 🛠️ FIX CHÍNH TẠI ĐÂY: Thêm i18n vào để không còn bị lỗi đen màn hình
    const { t, i18n } = useTranslation(); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Xác định ngôn ngữ hiện tại để switch text nhanh
    const isEn = i18n.language?.startsWith('en');

    // Xử lý hiệu ứng scroll để đổi nền Navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Kiểm tra login từ localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
    }, []);

    // Click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        setShowDropdown(false);
        window.location.reload();
    };

    return (
        <nav className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-brand">
                    CINEMA<span>X</span>
                </Link>

                {/* Navigation Links */}
                <div className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.home') || "Trang Chủ"}
                    </NavLink>
                    <NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.nowShowing') || "Phim Đang Chiếu"}
                    </NavLink>
                    <NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.comingSoon') || "Phim Sắp Chiếu"}
                    </NavLink>
                    <NavLink to="/lich-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.schedule') || "Lịch Chiếu"}
                    </NavLink>
                    <NavLink to="/rap" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.theaters') || "Rạp"}
                    </NavLink>
                    <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.news') || "Tin Tức"}
                    </NavLink>
                </div>

                {/* Right Section */}
                <div className="nav-right" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    
                    {/* NÚT CHUYỂN NGÔN NGỮ */}
                    <LanguageSwitcher />

                    {user ? (
                        <div className="user-profile">
                            <button 
                                className={`profile-toggle ${showDropdown ? 'active' : ''}`} 
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="avatar-wrapper">
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="username-text">{user.username}</span>
                                <i className="fa-solid fa-chevron-down arrow-icon"></i>
                            </button>

                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <p>{t('nav.dropdown.personalAccount') || (isEn ? "Personal Account" : "Tài khoản cá nhân")}</p>
                                        <span>{user.email || 'Thành viên CinemaX'}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    
                                    {/* Nút quay lại trang quản trị dành riêng cho ADMIN */}
                                    {(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || user.role === 'admin') && (
                                        <>
                                            <Link to="/admin" className="dropdown-item admin-link" onClick={() => setShowDropdown(false)}>
                                                <i className="fa-solid fa-user-gear" style={{color: '#ffc107'}}></i> 
                                                <span style={{fontWeight: 'bold', color: '#ffc107'}}>
                                                    {t('nav.dropdown.adminPage') || (isEn ? "Admin Dashboard" : "Trang Quản Trị")}
                                                </span>
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                        </>
                                    )}

                                    {/* Khách hàng thông thường */}
                                    {(user.role === 'ROLE_USER' || user.role === 'USER' || user.role === 'user') && (
                                        <>
                                            <Link to="/ho-so" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <i className="fa-regular fa-user"></i>{' '}
                                                {isEn ? 'My Profile' : 'Hồ sơ của tôi'}
                                            </Link>
                                            <Link to="/ve-da-dat" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <i className="fa-solid fa-ticket"></i>{' '}
                                                {isEn ? 'Booking History' : 'Lịch sử đặt vé'}
                                            </Link>
                                        </>
                                    )}
                                    
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <i className="fa-solid fa-right-from-bracket"></i> {t('nav.dropdown.logout') || (isEn ? "Logout" : "Đăng xuất")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="login-button" onClick={() => setIsModalOpen(true)}>
                            <i className="fa-regular fa-circle-user"></i>
                            <span>{t('nav.login') || "Đăng Nhập"}</span>
                        </button>
                    )}
                </div>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
};

export default Navbar;