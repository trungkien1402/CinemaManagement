import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import api from '../../api/axiosClient'; 
import '../style/Admin.css';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [movies, setMovies] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalMovies: 0, activeMovies: 0 });
    const [loading, setLoading] = useState(false);

    // Load dữ liệu Dashboard
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [mRes, sRes] = await Promise.all([
                api.get('/movies/admin/all'),
                api.get('/movies/admin/stats')
            ]);
            setMovies(mRes.data);
            setStats(sRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    // Load dữ liệu Người dùng
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users/all');
            setUsers(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') fetchDashboardData();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, fetchDashboardData]);

    const deleteUser = async (id) => {
        if (window.confirm("Xóa người dùng này?")) {
            await api.delete(`/admin/users/delete/${id}`);
            fetchUsers();
        }
    };

    return (
        <div className="admin-wrapper">
            <div className="admin-sidebar">
                <div className="admin-logo">CINEMA ADMIN</div>
                <nav className="admin-nav">
                    <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                    <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Người dùng</button>
                    <button className="nav-item" onClick={() => navigate('/')}>Về trang chủ</button>
                </nav>
                <button className="btn-logout-admin" onClick={() => { dispatch(logout()); navigate('/'); }}>Đăng xuất</button>
            </div>

            <div className="admin-main-content">
                <header className="admin-header">
                    <h2>{activeTab === 'dashboard' ? 'Tổng quan' : 'Quản lý người dùng'}</h2>
                    <div>Chào, <strong>{user?.username}</strong></div>
                </header>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="admin-stats-grid">
                            <div className="stat-card"><h3>Tổng Phim</h3><p>{stats.totalMovies}</p></div>
                            <div className="stat-card"><h3>Đang Chiếu</h3><p>{stats.activeMovies}</p></div>
                        </div>
                        <div className="admin-recent-table">
                            <h3>Phim mới cập nhật</h3>
                            <table>
                                <thead><tr><th>ID</th><th>Tên</th><th>Thể loại</th></tr></thead>
                                <tbody>
                                    {movies.map(m => <tr key={m.movieId}><td>{m.movieId}</td><td>{m.title}</td><td>{m.genre}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="admin-recent-table">
                        <table>
                            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Hành động</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.userId}>
                                        <td>{u.userId}</td>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td><button onClick={() => deleteUser(u.userId)} className="btn-delete">Xóa</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;