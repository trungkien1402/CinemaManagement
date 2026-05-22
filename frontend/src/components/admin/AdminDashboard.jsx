import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axiosClient';
import '../style/Admin.css';

// Thêm thư viện vẽ biểu đồ
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('movies');
    const [movies, setMovies] = useState([]);
    const [users, setUsers] = useState([]);
    // Thêm state lưu thống kê
    const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalTickets: 0 });
    
    const [loading, setLoading] = useState(false);
    const [editingMovieId, setEditingMovieId] = useState(null);

    const [movieForm, setMovieForm] = useState({
        title: '',
        description: '',
        genre: '',
        duration: '',
        releaseDate: '',
        image: '',
        status: 1
    });

    // ================= FETCH DATA =================
    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/movies/admin/all');
            setMovies(res.data);
        } catch (err) { console.error("Lỗi fetch movies:", err); }
        finally { setLoading(false); }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users/all');
            setUsers(res.data);
        } catch (err) { console.error("Lỗi fetch users:", err); }
        finally { setLoading(false); }
    }, []);

    // Hàm lấy dữ liệu thống kê
    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports/summary');
            setAnalytics(res.data);
        } catch (err) { console.error("Lỗi fetch thống kê:", err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === 'movies') fetchMovies();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'analytics') fetchAnalytics(); // Gọi khi chọn tab thống kê
    }, [activeTab, fetchMovies, fetchUsers, fetchAnalytics]);

    // ================= HANDLERS =================
    const handleMovieChange = (e) => {
        const { name, value } = e.target;
        setMovieForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingMovieId(null);
        setMovieForm({ title: '', description: '', genre: '', duration: '', releaseDate: '', image: '', status: 1 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMovieId) {
                await api.put(`/movies/admin/update/${editingMovieId}`, movieForm);
                alert('Cập nhật thành công!');
            } else {
                await api.post('/movies/admin/create', movieForm);
                alert('Thêm phim thành công!');
            }
            fetchMovies();
            resetForm();
        } catch (err) { alert('Thao tác thất bại, vui lòng kiểm tra lại!'); }
    };

    const handleDeleteMovie = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa phim này?')) {
            try {
                await api.delete(`/movies/admin/delete/${id}`);
                fetchMovies();
            } catch (err) { alert("Không thể xóa phim!"); }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Xóa người dùng này?')) {
            try {
                await api.delete(`/admin/users/delete/${id}`);
                fetchUsers();
            } catch (err) { alert("Không thể xóa người dùng!"); }
        }
    };

    return (
        <div className="admin-container">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo"
                onClick={() => setActiveTab('movies')} 
        style={{ cursor: 'pointer' }}
        >CINEMA ADMIN</div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>
                        <span className="icon">🎬</span> Quản lý phim
                    </button>

                    {/* NÚT THỐNG KÊ MỚI THÊM */}
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                        <span className="icon">📊</span> Thống kê doanh thu
                    </button>

                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <span className="icon">👥</span> Người dùng
                    </button>
                    <hr />
                    <button className="btn-exit" onClick={() => navigate('/')}>
                        <span className="icon">🏠</span> Về trang chủ
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-content">
                {loading && <div className="loading-spinner">Đang tải dữ liệu...</div>}

                {/* TAB PHIM - GIỮ NGUYÊN 100% CỦA ÔNG */}
                {activeTab === 'movies' && (
                    <div className="fade-in">
                        <h1 className="page-header">Quản lý kho phim</h1>
                        
                        {/* FORM */}
                        <form className="movie-card-admin movie-form" onSubmit={handleSubmit}>
                            <h3 className="card-title">{editingMovieId ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tên phim</label>
                                    <input name="title" value={movieForm.title} onChange={handleMovieChange} required placeholder="Nhập tên phim..." />
                                </div>
                                <div className="form-group">
                                    <label>Thể loại</label>
                                    <input name="genre" value={movieForm.genre} onChange={handleMovieChange} placeholder="Hành động, Tâm lý..." />
                                </div>
                                <div className="form-group">
                                    <label>Thời lượng (phút)</label>
                                    <input name="duration" type="number" value={movieForm.duration} onChange={handleMovieChange} />
                                </div>
                                <div className="form-group">
                                    <label>Ngày chiếu</label>
                                    <input name="releaseDate" type="date" value={movieForm.releaseDate} onChange={handleMovieChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Link ảnh Poster</label>
                                    <input name="image" value={movieForm.image} onChange={handleMovieChange} placeholder="https://..." />
                                </div>
                                <div className="form-group full-width">
                                    <label>Mô tả phim</label>
                                    <textarea name="description" value={movieForm.description} onChange={handleMovieChange} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-main">{editingMovieId ? 'Lưu cập nhật' : 'Tạo mới ngay'}</button>
                                {editingMovieId && <button type="button" className="btn-outline" onClick={resetForm}>Hủy bỏ</button>}
                            </div>
                        </form>

                        {/* TABLE */}
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Poster</th>
                                        <th>Thông tin phim</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movies.map(m => (
                                        <tr key={m.movieId}>
                                            <td><span className="id-badge">#{m.movieId}</span></td>
                                            <td><img src={m.image} alt="poster" className="table-img" /></td>
                                            <td>
                                                <div className="td-title">{m.title}</div>
                                                <div className="td-sub">{m.genre} • {m.duration}p</div>
                                            </td>
                                            <td>
                                                <button className="action-btn edit" onClick={() => { setEditingMovieId(m.movieId); setMovieForm(m); window.scrollTo(0,0); }}>Sửa</button>
                                                <button className="action-btn delete" onClick={() => handleDeleteMovie(m.movieId)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB THỐNG KÊ (MỚI THÊM) */}
                {activeTab === 'analytics' && (
                    <div className="fade-in">
                        <h1 className="page-header">Dashboard Doanh Thu</h1>
                        
                        <div className="analytics-grid">
                            <div className="stat-card">
                                <span className="stat-icon">💰</span>
                                <div className="stat-info">
                                    <h3>Tổng doanh thu</h3>
                                    <p>{analytics.totalRevenue?.toLocaleString('vi-VN')} VND</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-icon">🎟️</span>
                                <div className="stat-info">
                                    <h3>Tổng vé đã bán</h3>
                                    <p>{analytics.totalTickets} vé</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Biểu đồ cũng được bọc bằng class movie-card-admin để đồng bộ khung trắng */}
                        <div className="movie-card-admin" style={{ marginTop: '2rem' }}>
                            <h3 className="card-title">Biểu đồ doanh thu</h3>
                            <div style={{ height: '300px' }}>
                                <Bar 
                                    data={{ 
                                        labels: ['Doanh thu', 'Vé bán'], 
                                        datasets: [{ 
                                            label: 'Số liệu hệ thống', 
                                            data: [analytics.totalRevenue, analytics.totalTickets * 10000], 
                                            backgroundColor: ['#6366f1', '#a855f7'] 
                                        }] 
                                    }} 
                                    options={{ maintainAspectRatio: false }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB NGƯỜI DÙNG - GIỮ NGUYÊN 100% CỦA ÔNG */}
                {activeTab === 'users' && (
                    <div className="fade-in">
                        <h1 className="page-header">Danh sách người dùng</h1>
                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên người dùng</th>
                                        <th>Email</th>
                                        <th>Quyền</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.userId}>
                                            <td>#{u.userId}</td>
                                            <td><strong>{u.username}</strong></td>
                                            <td>{u.email}</td>
                                            <td><span className={`role-tag ${u.role}`}>{u.role}</span></td>
                                            <td>
                                                <button className="action-btn delete" onClick={() => handleDeleteUser(u.userId)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;