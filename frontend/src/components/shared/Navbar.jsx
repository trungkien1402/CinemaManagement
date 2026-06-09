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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <i className={isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                    </button>
                    <Link to="/" className="nav-brand" onClick={() => setIsMobileMenuOpen(false)}>
                        CINEMA<span>X</span>
                    </Link>
                </div>

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

                <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                    <NavbarSearch />

                    {user && (
                        <NotificationBell />
                    )}

                    {user ? (
                        <div className="user-profile" ref={userDropdownRef}>
                            <button
                                className={`profile-toggle ${showDropdown ? 'active' : ''}`}
                                onClick={() => {
                                    setShowDropdown(!showDropdown);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <div className="avatar-wrapper">
                                    {(user.avatar || user.avatarUrl) ? (
                                        <img src={user.avatar || user.avatarUrl} alt="avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        (user.fullName || user.username) ? (user.fullName || user.username).charAt(0).toUpperCase() : 'U'
                                    )}
                                </div>
                                <span className="username-text">{user.fullName || user.username}</span>
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
                                            <Link to="/ho-so" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <i className="fa-regular fa-user"></i>{' '}
                                                {isEn ? 'My Profile' : 'Hồ sơ của tôi'}
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
                </div>
            </div>

            {/* Mobile Navigation Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="mobile-nav-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.home') || "Trang Chủ"}
                    </NavLink>
                    <NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.nowShowing') || "Đang Chiếu"}
                    </NavLink>
                    <NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.comingSoon') || "Sắp Chiếu"}
                    </NavLink>
                    <NavLink to="/lich-chieu" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.schedule') || "Lịch Chiếu"}
                    </NavLink>
                    <NavLink to="/rap" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.theaters') || "Rạp"}
                    </NavLink>
                    <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"} onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.news') || "Tin Tức"}
                    </NavLink>
                </div>
            )}

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
};

export default Navbar;