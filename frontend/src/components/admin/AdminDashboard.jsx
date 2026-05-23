import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import '../style/Admin.css';

// Chart.js
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
    ArcElement, Title, Tooltip, Legend 
} from 'chart.js';

// QR Scanner
import { Html5QrcodeScanner } from 'html5-qrcode';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);

    // --- STATE KHO DỮ LIỆU ---
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalTickets: 0, monthlyData: [], topMovies: [] });

    // --- STATE ĐIỀU KHIỂN UI/SƠ ĐỒ GHẾ ---
    const [selectedTheaterId, setSelectedTheaterId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [seats, setSeats] = useState([]);
    const [manualTicketId, setManualTicketId] = useState('');

    // --- STATE QỦAN LÝ FORM ---
    const [editingMovieId, setEditingMovieId] = useState(null);
    const [movieForm, setMovieForm] = useState({
        title: '', description: '', trailerUrl: '', movieFormat: '2D',
        status: 1, duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: ''
    });

    const [roomForm, setRoomForm] = useState({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
    const [stForm, setStForm] = useState({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
    const [voucherForm, setVoucherForm] = useState({ voucherCode: '', discountPercent: 10, expiryDate: '' });

    // =========================================================================
    // 1. CALL API ĐỒNG BỘ DATA THEO TAB
    // =========================================================================
    const loadTabValues = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            if (activeTab === 'analytics') {
                const res = await api.get('/admin/showtimes-dashboard/summary', authHeader);
                setAnalytics(res.data);
            } else if (activeTab === 'movies') {
                const res = await api.get('/movies/admin/all', authHeader);
                setMovies(res.data);
            } else if (activeTab === 'bookings') {
                const res = await api.get('/admin/bookings/all', authHeader);
                setBookings(res.data);
            } else if (activeTab === 'theaters') {
                const res = await api.get('/admin/theaters/all');
                setTheaters(res.data);
            } else if (activeTab === 'showtimes') {
                const [st, mv, th] = await Promise.all([
                    api.get('/admin/showtimes/all'),
                    api.get('/movies/admin/all'),
                    api.get('/admin/theaters/all')
                ]);
                setShowtimes(st.data);
                setMovies(mv.data);
                setTheaters(th.data);
            } else if (activeTab === 'vouchers') {
                const res = await api.get('/admin/vouchers/all');
                setVouchers(res.data);
            }
        } catch (err) {
            console.error("Lỗi khi đồng bộ API dữ liệu Admin: ", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadTabValues();
    }, [loadTabValues]);

    // Lọc lấy phòng chiếu khi chọn Rạp tại mục Cấu hình
    useEffect(() => {
        if (selectedTheaterId) {
            api.get(`/admin/rooms/theater/${selectedTheaterId}`).then(res => setRooms(res.data));
        }
    }, [selectedTheaterId]);

    // Xem sơ đồ ghế vật lý khi chọn Phòng cụ thể
    useEffect(() => {
        if (selectedRoomId) {
            api.get(`/admin/seats/room/${selectedRoomId}`).then(res => setSeats(res.data));
        }
    }, [selectedRoomId]);

    // =========================================================================
    // 2. NGHIỆP VỤ QR CHECK-IN SOÁT VÉ
    // =========================================================================
    useEffect(() => {
        if (activeTab === 'qrcode-checkin') {
            scannerRef.current = new Html5QrcodeScanner('qr-reader-view', { fps: 12, qrbox: 250 });
            scannerRef.current.render(async (decodedText) => {
                if (scannerRef.current) scannerRef.current.clear();
                fireConfirmCheckin(decodedText);
            });
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, [activeTab]);

    const fireConfirmCheckin = async (id) => {
        if (!id) return alert("Vui lòng nhập mã Ticket ID");
        try {
            await api.put(`/admin/checkin/confirm/${id}`);
            alert(`✅ Vé #${id}: Xác nhận vào rạp thành công!`);
            setManualTicketId('');
        } catch (err) {
            alert("❌ Thất bại: " + (err.response?.data || "Mã vé không tồn tại hoặc đã sử dụng!"));
        }
    };

    // =========================================================================
    // 3. XỬ LÝ SỰ KIỆN FORM PHIM (MOVIES)
    // =========================================================================
    const saveOrUpdateMovie = async (e) => {
        e.preventDefault();
        try {
            if (editingMovieId) {
                await api.put(`/movies/admin/update/${editingMovieId}`, movieForm);
                alert("Cập nhật thông tin phim thành công!");
            } else {
                await api.post('/movies/admin/create', movieForm);
                alert("Thêm phim mới vào kho thành công!");
            }
            setEditingMovieId(null);
            setMovieForm({ title: '', description: '', trailerUrl: '', movieFormat: '2D', status: 1, duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: '' });
            loadTabValues();
        } catch (err) { alert("Lỗi xử lý phim: " + err.response?.data); }
    };

    const triggerEditMovie = (m) => {
        setEditingMovieId(m.movieId);
        setMovieForm({ ...m });
    };

    const deleteMovieObj = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bộ phim này khỏi danh mục không?")) return;
        try {
            await api.delete(`/movies/admin/delete/${id}`);
            alert("Đã xóa phim thành công!");
            loadTabValues();
        } catch (err) { alert("Lỗi hệ thống: Phim đã có lịch chiếu không thể xóa!"); }
    };

    // =========================================================================
    // 4. XỬ LÝ SỰ KIỆN PHÒNG & GHẾ (THEATERS/ROOMS)
    // =========================================================================
    const createNewRoomAndSeats = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) return alert("Vui lòng chọn Rạp cần thêm phòng!");
        try {
            await api.post(`/admin/rooms/create/${selectedTheaterId}`, roomForm);
            alert("Khởi tạo phòng và sinh ma trận ghế tự động thành công!");
            setRoomForm({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
            api.get(`/admin/rooms/theater/${selectedTheaterId}`).then(res => setRooms(res.data));
        } catch (err) { alert("Lỗi tạo phòng: " + err.response?.data); }
    };

    const toggleSeatMaintenance = async (seatId) => {
        try {
            await api.put(`/admin/seats/toggle-status/${seatId}`);
            setSeats(seats.map(s => s.seatId === seatId ? { ...s, isOccupied: !s.isOccupied } : s));
        } catch (err) { alert("Lỗi khóa ghế!"); }
    };

    // =========================================================================
    // 5. XỬ LÝ SUẤT CHIẾU & VOUCHER
    // =========================================================================
    const createShowtimeObj = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/showtimes/create', stForm);
            alert("Tạo lịch chiếu phim thành công!");
            setStForm({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
            loadTabValues();
        } catch (err) { alert("Lỗi tạo suất: " + err.response?.data); }
    };

    const saveVoucherObj = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/vouchers/create', voucherForm);
            alert("Phát hành Voucher quà tặng thành công!");
            setVoucherForm({ voucherCode: '', discountPercent: 10, expiryDate: '' });
            loadTabValues();
        } catch (err) { alert("Lỗi Voucher: " + err.response?.data); }
    };

    const deleteVoucherObj = async (code) => {
        try {
            await api.delete(`/admin/vouchers/delete/${code}`);
            loadTabValues();
        } catch (err) { alert("Lỗi xóa voucher"); }
    };

    // =========================================================================
    // 6. TIỀN XỬ LÝ BIẾU ĐỒ DOANH THU (CHARTS)
    // =========================================================================
    const barChartData = {
        labels: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
        datasets: [{
            label: 'Doanh thu (VND)',
            data: Array.from({ length: 12 }, (_, i) => {
                const match = analytics.monthlyData?.find(d => d.month === (i + 1));
                return match ? match.revenue : 0;
            }),
            backgroundColor: '#3b82f6',
            borderRadius: 4
        }]
    };

    const doughnutData = {
        labels: analytics.topMovies?.map(m => m.title) || [],
        datasets: [{
            data: analytics.topMovies?.map(m => m.ticketsSold) || [],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 1
        }]
    };

    return (
        <div className="admin-layout">
            {/* SIDEBAR ĐIỀU HƯỚNG */}
            <aside className="admin-navigation-panel">
                <div className="admin-brand">CINEMA MATRIX</div>
                <nav className="nav-menu-list">
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 Tổng quan</button>
                    <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>🎬 Quản lý Phim</button>
                    <button className={activeTab === 'theaters' ? 'active' : ''} onClick={() => setActiveTab('theaters')}>🏢 Cấu hình Phòng Ghế</button>
                    <button className={activeTab === 'showtimes' ? 'active' : ''} onClick={() => setActiveTab('showtimes')}>📅 Quản lý Suất chiếu</button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>🎟️ Nhật ký Hóa đơn</button>
                    <button className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => setActiveTab('vouchers')}>🎟️ Khuyến mãi Voucher</button>
                    <button className={activeTab === 'qrcode-checkin' ? 'active' : ''} onClick={() => setActiveTab('qrcode-checkin')}>🔍 Soát vé QR</button>
                    <div className="nav-divider"></div>
                    <button onClick={() => navigate('/')} className="exit-panel-btn">🏠 Về Trang Chủ</button>
                </nav>
            </aside>

            {/* PHẦN HIỂN THỊ CHỨC NĂNG */}
            <main className="admin-main-viewport">
                {loading && <div className="loading-spinner-overlay">Đang tải dữ liệu hệ thống...</div>}

                {/* TAB 1: TỔNG QUAN THỐNG KÊ */}
                {activeTab === 'analytics' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Báo Cáo Phân Tích Tài Chính</h2>
                        <div className="metric-cards-row">
                            <div className="metric-card card-green">
                                <h4>Tổng Doanh Thu Toàn Hệ Thống</h4>
                                <p className="number-display">{analytics.totalRevenue?.toLocaleString('vi-VN')}đ</p>
                            </div>
                            <div className="metric-card card-blue">
                                <h4>Tổng Số Lượng Vé Đã Bán</h4>
                                <p className="number-display">{analytics.totalTickets || 0} Vé</p>
                            </div>
                        </div>

                        <div className="visualization-grid">
                            <div className="chart-wrapper">
                                <h5>📈 Thống kê doanh số theo tháng (Năm 2026)</h5>
                                <Bar data={barChartData} />
                            </div>
                            <div className="chart-wrapper">
                                <h5>🎯 Thị phần doanh số theo Phim</h5>
                                {analytics.topMovies?.length > 0 ? (
                                    <Doughnut data={doughnutData} />
                                ) : <p className="empty-text">Chưa ghi nhận dữ liệu phim</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: QUẢN LÝ PHIM (ĐẦY ĐỦ FORM) */}
                {activeTab === 'movies' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Kho Lưu Trữ Phim Điện Ảnh</h2>
                        <form onSubmit={saveOrUpdateMovie} className="interactive-form-grid">
                            <input type="text" placeholder="Tên phim điện ảnh" value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
                            <input type="text" placeholder="Thể loại (Hành động, Tình cảm...)" value={movieForm.genre} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} />
                            <input type="number" placeholder="Thời lượng (Phút)" value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} />
                            <input type="text" placeholder="Đạo diễn / Tác giả" value={movieForm.author} onChange={e => setMovieForm({...movieForm, author: e.target.value})} />
                            <input type="text" placeholder="Đường dẫn ảnh Poster" value={movieForm.image} onChange={e => setMovieForm({...movieForm, image: e.target.value})} />
                            <input type="text" placeholder="Đường dẫn Trailer YouTube" value={movieForm.trailerUrl} onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} />
                            <input type="date" value={movieForm.releaseDate} onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})} />
                            
                            <select value={movieForm.movieFormat} onChange={e => setMovieForm({...movieForm, movieFormat: e.target.value})}>
                                <option value="2D">Định dạng 2D</option>
                                <option value="3D">Định dạng 3D</option>
                                <option value="IMAX">Định dạng IMAX</option>
                            </select>
                            <select value={movieForm.ageRating} onChange={e => setMovieForm({...movieForm, ageRating: e.target.value})}>
                                <option value="P">P - Mọi lứa tuổi</option>
                                <option value="T13">T13 - Từ 13 tuổi</option>
                                <option value="T16">T16 - Từ 16 tuổi</option>
                                <option value="T18">T18 - Phim giới hạn 18+</option>
                            </select>
                            <select value={movieForm.status} onChange={e => setMovieForm({...movieForm, status: parseInt(e.target.value)})}>
                                <option value={1}>Trạng thái: Sắp chiếu</option>
                                <option value={2}>Trạng thái: Đang chiếu</option>
                                <option value={0}>Trạng thái: Ngưng chiếu</option>
                            </select>
                            
                            <textarea className="full-width-field" placeholder="Tóm tắt cốt truyện phim..." value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
                            <button type="submit" className="form-submit-btn-main">{editingMovieId ? "💾 Cập Nhật Phim" : "➕ Thêm Phim Mới"}</button>
                        </form>

                        <div className="table-responsive-box">
                            <table className="data-display-table">
                                <thead>
                                    <tr><th>Mã Phim</th><th>Hình ảnh</th><th>Tên Phim</th><th>Định dạng</th><th>Độ tuổi</th><th>Hành động</th></tr>
                                </thead>
                                <tbody>
                                    {movies.map(m => (
                                        <tr key={m.movieId}>
                                            <td>#{m.movieId}</td>
                                            <td><img src={m.image} alt="" className="table-thumbnail-img" /></td>
                                            <td><strong>{m.title}</strong></td>
                                            <td><span className="badge-format">{m.movieFormat}</span></td>
                                            <td><span className="badge-age">{m.ageRating}</span></td>
                                            <td>
                                                <button onClick={() => triggerEditMovie(m)} className="control-btn btn-edit-sm">Sửa</button>
                                                <button onClick={() => deleteMovieObj(m.movieId)} className="control-btn btn-delete-sm">Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: CẤU HÌNH PHÒNG GHẾ & MAP SƠ ĐỒ THỦ CÔNG */}
                {activeTab === 'theaters' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Hệ Thống Hạ Tầng Cụm Rạp</h2>
                        <div className="dual-column-panel">
                            <div className="form-settings-panel">
                                <h5>📍 Chọn vị trí Cụm Rạp</h5>
                                <select value={selectedTheaterId} onChange={e => { setSelectedTheaterId(e.target.value); setSelectedRoomId(''); setSeats([]); }}>
                                    <option value="">-- Chọn danh sách rạp chiếu --</option>
                                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                                </select>

                                {selectedTheaterId && (
                                    <form onSubmit={createNewRoomAndSeats} className="sub-form-box">
                                        <h5>🏢 Thêm phòng chiếu mới & Sinh ghế tự động</h5>
                                        <input type="text" placeholder="Mã phòng (Ví dụ: P01_RẠP_A)" value={roomForm.roomId} onChange={e => setRoomForm({...roomForm, roomId: e.target.value})} required />
                                        <input type="text" placeholder="Tên phòng hiển thị (Ví dụ: Phòng Số 1)" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} required />
                                        <label>Số hàng ghế vật lý (A-Z):</label>
                                        <input type="number" value={roomForm.rowsCount} onChange={e => setRoomForm({...roomForm, rowsCount: parseInt(e.target.value)})} />
                                        <label>Số ghế trên mỗi hàng:</label>
                                        <input type="number" value={roomForm.colsCount} onChange={e => setRoomForm({...roomForm, colsCount: parseInt(e.target.value)})} />
                                        <button type="submit" className="form-submit-btn-main">Khởi Tạo & Cấu Hình Sơ Đồ Ghế</button>
                                    </form>
                                )}
                            </div>

                            <div className="visualization-settings-panel">
                                <h5>🖥️ Sơ đồ thiết kế phòng ghế vật lý</h5>
                                <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                                    <option value="">-- Chọn phòng chiếu hiển thị sơ đồ --</option>
                                    {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber} ({r.totalSeats} ghế)</option>)}
                                </select>

                                {selectedRoomId && (
                                    <div>
                                        <div className="cinema-screen-bar">MÀN HÌNH CHIẾU PHIM</div>
                                        <div className="seats-matrix-grid-display">
                                            {seats.map(s => (
                                                <button 
                                                    key={s.seatId} 
                                                    onClick={() => toggleSeatMaintenance(s.seatId)}
                                                    className={`seat-node ${s.seatType === 'VIP' ? 'vip' : 'normal'} ${s.isOccupied ? 'maintenance-lock' : ''}`}
                                                    title={`Mã ghế: ${s.seatNumber} \nBấm để Khóa/Mở bảo trì`}
                                                >
                                                    {s.seatNumber}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="legend-row">
                                            <span className="legend-item"><span className="box normal"></span> Ghế Thường</span>
                                            <span className="legend-item"><span className="box vip"></span> Ghế VIP</span>
                                            <span className="legend-item"><span className="box locked"></span> Đang bảo trì (Khóa)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: QUẢN LÝ SUẤT CHIẾU (SHOWTIMES) */}
                {activeTab === 'showtimes' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Cấu Hình Lịch Trình Chiếu Phim</h2>
                        <form onSubmit={createShowtimeObj} className="interactive-form-grid">
                            <select value={stForm.movieId} onChange={e => setStForm({...stForm, movieId: e.target.value})} required>
                                <option value="">-- Bước 1: Chọn Phim Chiếu --</option>
                                {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                            </select>

                            <select value={selectedTheaterId} onChange={e => setSelectedTheaterId(e.target.value)}>
                                <option value="">-- Bước 2: Chọn Cụm Rạp --</option>
                                {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                            </select>

                            <select value={stForm.roomId} onChange={e => setStForm({...stForm, roomId: e.target.value})} required>
                                <option value="">-- Bước 3: Chọn Phòng Chiếu --</option>
                                {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
                            </select>

                            <input type="date" value={stForm.showDate} onChange={e => setStForm({...stForm, showDate: e.target.value})} required />
                            <input type="time" value={stForm.startTime} onChange={e => setStForm({...stForm, startTime: e.target.value})} required />
                            <input type="number" placeholder="Đơn giá vé (VND)" value={stForm.ticketPrice} onChange={e => setStForm({...stForm, ticketPrice: parseFloat(e.target.value)})} required />
                            
                            <button type="submit" className="form-submit-btn-main full-width-field">⚡ Phát Hành Lịch Chiếu</button>
                        </form>

                        <div className="table-responsive-box">
                            <table className="data-display-table">
                                <thead>
                                    <tr><th>Mã Suất</th><th>Tên Phim</th><th>Phòng Chiếu</th><th>Ngày Chiếu</th><th>Giờ Bắt Đầu</th><th>Giá Vé niêm yết</th></tr>
                                </thead>
                                <tbody>
                                    {showtimes.map(st => (
                                        <tr key={st.showtimeId}>
                                            <td><strong>{st.showtimeId}</strong></td>
                                            <td>{st.movie?.title}</td>
                                            <td>{st.room?.roomNumber}</td>
                                            <td>{st.showDate}</td>
                                            <td><span className="time-badge">{st.startTime}</span></td>
                                            <td>{st.ticketPrice?.toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 5: LỊCH SỬ HOÁ ĐƠN (BOOKINGS) */}
                {activeTab === 'bookings' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Nhật Ký Giao Dịch Đặt Vé Toàn Hệ Thống</h2>
                        <div className="table-responsive-box">
                            <table className="data-display-table">
                                <thead>
                                    <tr><th>Mã Hoá Đơn</th><th>Tài khoản</th><th>Tên Phim</th><th>Ghế</th><th>Giá Tiền</th><th>Ngày Đặt Vé</th><th>Trạng Thái</th></tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.ticketId}>
                                            <td><code className="invoice-code">#{b.ticketId}</code></td>
                                            <td>{b.user?.username || "Ẩn danh"}</td>
                                            <td>{b.showtime?.movie?.title}</td>
                                            <td><span className="seat-badge">{b.seat?.seatNumber}</span></td>
                                            <td><strong>{b.totalPrice?.toLocaleString()}đ</strong></td>
                                            <td>{b.bookingDate}</td>
                                            <td><span className="status-label success">{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 6: MÃ KHUYẾN MÃI (VOUCHERS) */}
                {activeTab === 'vouchers' && (
                    <div className="tab-view">
                        <h2 className="tab-title">Cơ Cấu Chương Trình Khuyến Mãi Voucher</h2>
                        <form onSubmit={saveVoucherObj} className="interactive-form-grid">
                            <input type="text" placeholder="Mã Khuyến Mãi (Ví dụ: MOVIE2026)" value={voucherForm.voucherCode} onChange={e => setVoucherForm({...voucherForm, voucherCode: e.target.value})} required />
                            <input type="number" placeholder="Tỷ lệ giảm giá (%)" min="1" max="100" value={voucherForm.discountPercent} onChange={e => setVoucherForm({...voucherForm, discountPercent: parseInt(e.target.value)})} required />
                            <input type="date" value={voucherForm.expiryDate} onChange={e => setVoucherForm({...voucherForm, expiryDate: e.target.value})} required />
                            <button type="submit" className="form-submit-btn-main">🎁 Phát Hành Mã Quà Tặng</button>
                        </form>

                        <div className="table-responsive-box">
                            <table className="data-display-table">
                                <thead>
                                    <tr><th>Mã Voucher</th><th>Phần trăm chiết khấu</th><th>Hạn sử dụng</th><th>Hành động</th></tr>
                                </thead>
                                <tbody>
                                    {vouchers.map(v => (
                                        <tr key={v.voucherCode}>
                                            <td><code className="voucher-highlight">{v.voucherCode}</code></td>
                                            <td>Giảm {v.discountPercent}%</td>
                                            <td>{v.expiryDate}</td>
                                            <td>
                                                <button onClick={() => deleteVoucherObj(v.voucherCode)} className="control-btn btn-delete-sm">Hủy bỏ</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 7: QUÉT MÃ QR SOÁT VÉ (CHECK-IN VÀO CỬA) */}
                {activeTab === 'qrcode-checkin' && (
                    <div className="tab-view central-align-layout">
                        <h2 className="tab-title">Cổng Soát Vé Tự Động (QR Gate)</h2>
                        <div className="qr-scanner-workspace">
                            <div id="qr-reader-view"></div>
                            
                            <div className="manual-override-box">
                                <div className="or-divider">HOẶC NHẬP MÃ THỦ CÔNG</div>
                                <input 
                                    type="text" 
                                    className="manual-field" 
                                    placeholder="Điền Ticket ID (Ví dụ: TK-177281)..." 
                                    value={manualTicketId}
                                    onChange={e => setManualTicketId(e.target.value)}
                                />
                                <button className="manual-verify-btn" onClick={() => fireConfirmCheckin(manualTicketId)}>Xác Thực Vé Vào Cửa</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;