import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthModal from '../auth/AuthModal'; 
import './style/Navbar.css';

const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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
        <nav className="navbar-main">
            <div className="nav-wrapper">
                {/* Logo */}
                <Link to="/" className="nav-brand">
                    Cinema<span>X</span>
                </Link>

                {/* Navigation Links */}
                <div className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>Trang Chủ</NavLink>
                    <NavLink to="/dang-chieu" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>Đang Chiếu</NavLink>
                    <NavLink to="/sap-chieu" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>Sắp Chiếu</NavLink>
                </div>

                {/* Account Section */}
                <div className="nav-right" ref={dropdownRef}>
                    {user ? (
                        <div className="profile-section">
                            <div 
                                className={`profile-trigger ${showDropdown ? 'active' : ''}`} 
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <div className="user-avatar">
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="user-name">{user.username}</span>
                                <i className={`fa-solid fa-chevron-down arrow ${showDropdown ? 'up' : ''}`}></i>
                            </div>

                            {showDropdown && (
                                <div className="custom-dropdown">
                                    <div className="dropdown-info">
                                        <span>Xin chào,</span>
                                        <strong>{user.username}</strong>
                                    </div>
                                    <div className="divider"></div>
                                    <button className="dropdown-btn logout" onClick={handleLogout}>
                                        <i className="fa-solid fa-right-from-bracket"></i>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="account-btn-modern" onClick={() => setIsModalOpen(true)}>
                            <i className="fa-regular fa-circle-user"></i>
                            <span>Tài Khoản</span>
                        </button>
                    )}
                </div>
            </div>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </nav>
    );
};

export default Navbar;