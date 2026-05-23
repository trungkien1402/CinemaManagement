import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import '../style/Admin.css';
// Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
// QR Scanner
import { Html5QrcodeScanner } from 'html5-qrcode';

// Import các sub-component vừa được tách nhỏ
import AnalyticsTab from './AnalyticsTab';
import MoviesTab from './MoviesTab';
import TheatersTab from './TheatersTab';
import ShowtimesTab from './ShowtimesTab';
import BookingsTab from './BookingsTab';
import VouchersTab from './VouchersTab';
import QrcodeCheckinTab from './QrcodeCheckinTab';

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
            
            {/* PHẦN HIỂN THỊ CHỨC NĂNG TẬP TRUNG */}
            <main className="admin-main-viewport">
                {loading && <div className="loading-spinner-overlay">Đang tải dữ liệu hệ thống...</div>}
                
                {activeTab === 'analytics' && (
                    <AnalyticsTab analytics={analytics} barChartData={barChartData} doughnutData={doughnutData} />
                )}
                {activeTab === 'movies' && (
                    <MoviesTab 
                        movieForm={movieForm} setMovieForm={setMovieForm} saveOrUpdateMovie={saveOrUpdateMovie} 
                        editingMovieId={editingMovieId} movies={movies} triggerEditMovie={triggerEditMovie} deleteMovieObj={deleteMovieObj} 
                    />
                )}
                {activeTab === 'theaters' && (
                    <TheatersTab 
                        selectedTheaterId={selectedTheaterId} setSelectedTheaterId={setSelectedTheaterId} 
                        setSelectedRoomId={setSelectedRoomId} setSeats={setSeats} theaters={theaters} 
                        createNewRoomAndSeats={createNewRoomAndSeats} roomForm={roomForm} setRoomForm={setRoomForm} 
                        selectedRoomId={selectedRoomId} rooms={rooms} seats={seats} toggleSeatMaintenance={toggleSeatMaintenance} 
                    />
                )}
                {activeTab === 'showtimes' && (
                    <ShowtimesTab 
                        createShowtimeObj={createShowtimeObj} stForm={stForm} setStForm={setStForm} 
                        movies={movies} selectedTheaterId={selectedTheaterId} setSelectedTheaterId={setSelectedTheaterId} 
                        theaters={theaters} rooms={rooms} showtimes={showtimes} 
                    />
                )}
                {activeTab === 'bookings' && (
                    <BookingsTab bookings={bookings} />
                )}
                {activeTab === 'vouchers' && (
                    <VouchersTab 
                        saveVoucherObj={saveVoucherObj} voucherForm={voucherForm} setVoucherForm={setVoucherForm} 
                        vouchers={vouchers} deleteVoucherObj={deleteVoucherObj} 
                    />
                )}
                {activeTab === 'qrcode-checkin' && (
                    <QrcodeCheckinTab 
                        manualTicketId={manualTicketId} setManualTicketId={setManualTicketId} 
                        fireConfirmCheckin={fireConfirmCheckin} 
                    />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;