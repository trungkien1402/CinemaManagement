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
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 💡 State quản lý đóng/mở Sidebar trên Mobile
    const dropdownRef = useRef(null);

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
        setIsMenuOpen(false); // Đóng menu nếu đang mở
        window.location.reload();
    };

    // 💡 Hàm tự động đóng Sidebar khi người dùng click chọn chuyển trang tin tức/phim
    const closeMobileMenu = () => {
        setIsMenuOpen(false);
    };

    return (
    <>
        <nav className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                {/* 1. Logo */}
                <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
                    CINEMA<span>X</span>
                </Link>

                {/* 2. Navigation Links (Sidebar Mobile) */}
                <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Trang Chủ
                    </NavLink>
                    <NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Phim Đang Chiếu
                    </NavLink>
                    <NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Phim Sắp Chiếu
                    </NavLink>
                    <NavLink to="/lich-chieu" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Lịch Chiếu
                    </NavLink>
                    <NavLink to="/rap" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Rạp
                    </NavLink>
                    <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>
                        Tin Tức
                    </NavLink>
                <NavbarSearch />

                <NotificationBell />
                </div>


                {/* 3. Right Section (Chỉ chứa Profile / Login) */}
                <div className="nav-right" ref={dropdownRef}>
                    {user ? (
                        <div className="user-profile" ref={userDropdownRef}>
                            <button
                                className={`profile-toggle ${showDropdown ? 'active' : ''}`}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="avatar-wrapper">
                                    {/* 🚀 ĐÃ SỬA: Ưu tiên lấy avatar hoặc avatarUrl, nếu không có thì lấy chữ cái đầu của Tên (fullName hoặc username) */}
                                    {(user.avatar || user.avatarUrl) ? (
                                        <img src={user.avatar || user.avatarUrl} alt="avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        (user.fullName || user.username) ? (user.fullName || user.username).charAt(0).toUpperCase() : 'U'
                                    )}
                                </div>
                                {/* 🚀 ĐÃ SỬA: Ưu tiên hiển thị fullName (Họ và Tên), nếu chưa có mới hiển thị username */}
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
                                            <Link to="/admin" className="dropdown-item admin-link" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                                                <i className="fa-solid fa-user-gear" style={{color: '#ffc107'}}></i> 
                                                <span style={{fontWeight: 'bold', color: '#ffc107'}}>Trang Quản Trị</span>
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                        </>
                                    )}
                                    <Link to="/ho-so" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                                        <i className="fa-regular fa-user"></i> Hồ sơ của tôi
                                    </Link>
                                    <Link to="/ve-da-dat" className="dropdown-item" onClick={() => { setShowDropdown(false); closeMobileMenu(); }}>
                                        <i className="fa-solid fa-ticket"></i> Lịch sử đặt vé
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <i className="fa-solid fa-right-from-bracket"></i> {t('nav.dropdown.logout') || (isEn ? "Logout" : "Đăng xuất")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="login-button" onClick={() => { setIsModalOpen(true); closeMobileMenu(); }}>
                            <i className="fa-regular fa-circle-user"></i>
                            <span>{t('nav.login') || "Đăng Nhập"}</span>
                        </button>
                    )}

        
                </div>

                {/* 💡 ĐÃ ĐƯA RA NGOÀI: Nút Hamburger nằm độc lập cuối container */}
                <button 
                    className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>

        {/* Lớp phủ tối màn hình */}
        <div 
            className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} 
            onClick={closeMobileMenu}
        ></div>
    </>
);
};

export default Navbar;