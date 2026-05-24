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
import { useTranslation } from 'react-i18next'; // 👈 Giữ nguyên import bộ dịch

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const { t, i18n } = useTranslation(); // 👈 Lấy thêm i18n để gọi hàm đổi ngôn ngữ trực tiếp
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

    // 💡 HÀM ĐỔI NGÔN NGỮ KHI CLICK NÚT UI
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

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
        if (!id) return alert(t('admin.adminDashboard.alerts.requireTicketId'));
        try {
            await api.put(`/admin/checkin/confirm/${id}`);
            alert(`${t('admin.adminDashboard.alerts.checkinSuccess')} #${id}`);
            setManualTicketId('');
        } catch (err) {
            alert(t('admin.adminDashboard.alerts.checkinFail') + (err.response?.data || t('admin.adminDashboard.alerts.checkinFailFallback')));
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
                alert(t('admin.adminDashboard.alerts.movieUpdateSuccess'));
            } else {
                await api.post('/movies/admin/create', movieForm);
                alert(t('admin.adminDashboard.alerts.movieCreateSuccess'));
            }
            setEditingMovieId(null);
            setMovieForm({ title: '', description: '', trailerUrl: '', movieFormat: '2D', status: 1, duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: '' });
            loadTabValues();
        } catch (err) { alert(t('admin.adminDashboard.alerts.movieError') + err.response?.data); }
    };

    const triggerEditMovie = (m) => {
        setEditingMovieId(m.movieId);
        setMovieForm({ ...m });
    };

    const deleteMovieObj = async (id) => {
        if (!window.confirm(t('admin.adminDashboard.alerts.confirmDeleteMovie'))) return;
        try {
            await api.delete(`/movies/admin/delete/${id}`);
            alert(t('admin.adminDashboard.alerts.movieDeleteSuccess'));
            loadTabValues();
        } catch (err) { alert(t('admin.adminDashboard.alerts.movieDeleteFail')); }
    };

    // =========================================================================
    // 4. XỬ LÝ SỰ KIỆN PHÒNG & GHẾ (THEATERS/ROOMS)
    // =========================================================================
    const createNewRoomAndSeats = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) return alert(t('admin.adminDashboard.alerts.requireTheaterForRoom'));
        try {
            await api.post(`/admin/rooms/create/${selectedTheaterId}`, roomForm);
            alert(t('admin.adminDashboard.alerts.roomCreateSuccess'));
            setRoomForm({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
            api.get(`/admin/rooms/theater/${selectedTheaterId}`).then(res => setRooms(res.data));
        } catch (err) { alert(t('admin.adminDashboard.alerts.roomError') + err.response?.data); }
    };

    const toggleSeatMaintenance = async (seatId) => {
        try {
            await api.put(`/admin/seats/toggle-status/${seatId}`);
            setSeats(seats.map(s => s.seatId === seatId ? { ...s, isOccupied: !s.isOccupied } : s));
        } catch (err) { alert(t('admin.adminDashboard.alerts.seatError')); }
    };

    // =========================================================================
    // 5. XỬ LÝ SUẤT CHIẾU & VOUCHER
    // =========================================================================
    const createShowtimeObj = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/showtimes/create', stForm);
            alert(t('admin.adminDashboard.alerts.showtimeCreateSuccess'));
            setStForm({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
            loadTabValues();
        } catch (err) { alert(t('admin.adminDashboard.alerts.showtimeError') + err.response?.data); }
    };

    const saveVoucherObj = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/vouchers/create', voucherForm);
            alert(t('admin.adminDashboard.alerts.voucherCreateSuccess'));
            setVoucherForm({ voucherCode: '', discountPercent: 10, expiryDate: '' });
            loadTabValues();
        } catch (err) { alert(t('admin.adminDashboard.alerts.voucherError') + err.response?.data); }
    };

    const deleteVoucherObj = async (code) => {
        try {
            await api.delete(`/admin/vouchers/delete/${code}`);
            loadTabValues();
        } catch (err) { alert(t('admin.adminDashboard.alerts.voucherDeleteError')); }
    };

    // =========================================================================
    // 6. TIỀN XỬ LÝ BIẾU ĐỒ DOANH THU (CHARTS)
    // =========================================================================
    const barChartData = {
        labels: [
            t('admin.adminDashboard.months.m1'), t('admin.adminDashboard.months.m2'), t('admin.adminDashboard.months.m3'),
            t('admin.adminDashboard.months.m4'), t('admin.adminDashboard.months.m5'), t('admin.adminDashboard.months.m6'),
            t('admin.adminDashboard.months.m7'), t('admin.adminDashboard.months.m8'), t('admin.adminDashboard.months.m9'),
            t('admin.adminDashboard.months.m10'), t('admin.adminDashboard.months.m11'), t('admin.adminDashboard.months.m12')
        ],
        datasets: [{
            label: t('admin.adminDashboard.charts.revenueLabel'),
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
                
                {/* 💡 ĐÂY RỒI: CỤM NÚT SWITCH NGÔN NGỮ NẰM NGAY TRÊN SIDEBAR */}
                <div className="lang-switcher-admin" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', padding: '0 20px' }}>
                    <button 
                        onClick={() => changeLanguage('vi')} 
                        style={{ padding: '4px 12px', background: i18n.language === 'vi' ? '#3b82f6' : '#222228', color: '#fff', border: '1px solid #33333d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                        VI
                    </button>
                    <button 
                        onClick={() => changeLanguage('en')} 
                        style={{ padding: '4px 12px', background: i18n.language === 'en' ? '#3b82f6' : '#222228', color: '#fff', border: '1px solid #33333d', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                        EN
                    </button>
                </div>

                <nav className="nav-menu-list">
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 {t('admin.adminDashboard.tabs.analytics')}</button>
                    <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>🎬 {t('admin.adminDashboard.tabs.movies')}</button>
                    <button className={activeTab === 'theaters' ? 'active' : ''} onClick={() => setActiveTab('theaters')}>🏢 {t('admin.adminDashboard.tabs.theaters')}</button>
                    <button className={activeTab === 'showtimes' ? 'active' : ''} onClick={() => setActiveTab('showtimes')}>📅 {t('admin.adminDashboard.tabs.showtimes')}</button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>🎟️ {t('admin.adminDashboard.tabs.bookings')}</button>
                    <button className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => setActiveTab('vouchers')}>🎟️ {t('admin.adminDashboard.tabs.vouchers')}</button>
                    <button className={activeTab === 'qrcode-checkin' ? 'active' : ''} onClick={() => setActiveTab('qrcode-checkin')}>🔍 {t('admin.adminDashboard.tabs.qrcodeCheckin')}</button>
                    <div className="nav-divider"></div>
                    <button onClick={() => navigate('/')} className="exit-panel-btn">🏠 {t('admin.adminDashboard.tabs.backToHome')}</button>
                </nav>
            </aside>
            
            {/* PHẦN HIỂN THỊ CHỨC NĂNG TẬP TRUNG */}
            <main className="admin-main-viewport">
                {loading && <div className="loading-spinner-overlay">{t('admin.adminDashboard.status.loading')}</div>}
                
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