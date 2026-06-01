import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthModal from '../auth/AuthModal'; 
import LanguageSwitcher from './LanguageSwitcher'; 
import '../style/Navbar.css';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import NavbarSearch from './NavbarSearch';

const Navbar = () => {
    const { t, i18n } = useTranslation(); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const userDropdownRef = useRef(null);

    const isEn = i18n.language?.startsWith('en');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
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
                {/* Logo thương hiệu */}
                <Link to="/" className="nav-brand">
                    CINEMA<span>X</span>
                </Link>

                {/* Danh mục chuyển trang */}
                <div className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.home') || "Trang Chủ"}
                    </NavLink>
                    <NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.nowShowing') || "Đang Chiếu"}
                    </NavLink>
                    <NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {t('nav.comingSoon') || "Sắp Chiếu"}
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
     
                {/* Khu vực tính năng bên phải Navbar */}
                <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    
                    {/* 1. Ô tìm kiếm */}
                    <NavbarSearch />
                    
                    {/* 2. Quả chuông thông báo */}
                    <NotificationBell />
                    
                    {/* 3. Khối kiểm tra Trạng thái Tài khoản / Đăng Nhập */}
                    {user ? (
                        <div className="user-profile" ref={userDropdownRef}>
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

                    {/* 4. 🌐 NÚT CHUYỂN NGÔN NGỮ: Đã đưa ra sau cùng */}
                    <LanguageSwitcher />
                </div>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
};

export default Navbar;