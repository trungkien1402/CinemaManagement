import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import './Admin.css';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="admin-wrapper">
            <div className="admin-sidebar">
                <div className="admin-logo">CINEMA ADMIN</div>
                <nav className="admin-nav">
                    <button className="nav-item active">Dashboard</button>
                    <button className="nav-item">Quản lý Phim</button>
                    <button className="nav-item">Lịch Chiếu</button>
                    <button className="nav-item">Quản lý Vé</button>
                    <button className="nav-item">Người dùng</button>
                </nav>
                <button className="btn-logout-admin" onClick={handleLogout}>Đăng xuất</button>
            </div>

            <div className="admin-main-content">
                <header className="admin-header">
                    <h2>Tổng quan hệ thống</h2>
                    <div className="admin-user-info">
                        Chào, <strong>{user?.email}</strong>
                    </div>
                </header>

                <div className="admin-stats-grid">
                    <div className="stat-card">
                        <h3>Tổng Phim</h3>
                        <p>24</p>
                    </div>
                    <div className="stat-card">
                        <h3>Vé Đã Bán</h3>
                        <p>1,250</p>
                    </div>
                    <div className="stat-card">
                        <h3>Doanh Thu</h3>
                        <p>150.000.000đ</p>
                    </div>
                    <div className="stat-card">
                        <h3>Người Dùng</h3>
                        <p>450</p>
                    </div>
                </div>

                <div className="admin-recent-table">
                    <h3>Phim đang chiếu</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Phim</th>
                                <th>Thời lượng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#001</td>
                                <td>Avengers: End Game</td>
                                <td>180 phút</td>
                                <td><span className="status-on">Đang chiếu</span></td>
                            </tr>
                            <tr>
                                <td>#002</td>
                                <td>Doraemon</td>
                                <td>90 phút</td>
                                <td><span className="status-on">Đang chiếu</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;