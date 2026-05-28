import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthModal from '../auth/AuthModal'; 
import '../style/Navbar.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Navbar = () => {
    const { t, i18n } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

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
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setDisplayName(parsedUser.fullName || parsedUser.username || '');
            } catch (e) {
                console.error("Lỗi parse user:", e);
            }
        }
    }, []);

    useEffect(() => {
        const userId = user?.id || user?.userId;
        if (!userId) return;

        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        axios.get(`http://localhost:8080/api/users/${userId}`, config)
            .then(response => {
                const realName = response.data.fullName || response.data.username || user.username;
                setDisplayName(realName);
            })
            .catch(error => {
                console.error("Lỗi đồng bộ dữ liệu tươi cho Navbar:", error);
            });
    }, [user]);

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
        localStorage.removeItem("token");
        setUser(null);
        setDisplayName('');
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

                    {user ? (
                        <div className="user-profile">
                            <button
                                className={`profile-toggle ${showDropdown ? 'active' : ''}`}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="avatar-wrapper">
                                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="username-text">{displayName}</span>
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
                </div>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
};

export default Navbar;