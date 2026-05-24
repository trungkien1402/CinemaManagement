import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import '../style/Admin.css';
import { Html5QrcodeScanner } from 'html5-qrcode';

import AnalyticsTab from './AnalyticsTab';
import MoviesTab from './MoviesTab';
import TheatersTab from './TheatersTab';
import ShowtimesTab from './ShowtimesTab';
import BookingsTab from './BookingsTab';
import VouchersTab from './VouchersTab';
import QrcodeCheckinTab from './QrcodeCheckinTab';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);
    
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalTickets: 0, monthlyData: [], topMovies: [] });
    
    const [selectedTheaterId, setSelectedTheaterId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [seats, setSeats] = useState([]);
    const [manualTicketId, setManualTicketId] = useState('');
    
    const [editingMovieId, setEditingMovieId] = useState(null);
    const [movieForm, setMovieForm] = useState({
        title: '', description: '', trailerUrl: '', movieFormat: '2D',
        status: '1', // ✅ Mặc định ban đầu là "1" (Bây giờ là Đang chiếu)
        duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: ''
    });
    const [roomForm, setRoomForm] = useState({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
    const [stForm, setStForm] = useState({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
    const [voucherForm, setVoucherForm] = useState({ voucherCode: '', discountPercent: 10, expiryDate: '' });

    const loadTabValues = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            
            if (activeTab === 'analytics') {
                const res = await api.get('/admin/showtimes-dashboard/summary', authHeader);
                setAnalytics(res.data);
            } else if (activeTab === 'movies') {
                // Thêm timestamp xóa triệt để cache của trình duyệt
                const res = await api.get(`/movies/admin/all?t=${new Date().getTime()}`, authHeader);
                setMovies(res.data);
            } else if (activeTab === 'bookings') {
                const res = await api.get('/admin/bookings/all', authHeader);
                setBookings(res.data);
            } else if (activeTab === 'theaters') {
                const res = await api.get('/admin/theaters/all', authHeader);
                setTheaters(res.data);
            } else if (activeTab === 'showtimes') {
                const [st, mv, th] = await Promise.all([
                    api.get('/admin/showtimes/all', authHeader),
                    api.get(`/movies/admin/all?t=${new Date().getTime()}`, authHeader),
                    api.get('/admin/theaters/all', authHeader)
                ]);
                setShowtimes(st.data);
                setMovies(mv.data);
                setTheaters(th.data);
            } else if (activeTab === 'vouchers') {
                const res = await api.get('/admin/vouchers/all', authHeader);
                setVouchers(res.data);
            }
        } catch (err) {
            console.error("Lỗi đồng bộ dữ liệu: ", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadTabValues();
    }, [loadTabValues]);

    useEffect(() => {
        if (selectedTheaterId) {
            const token = localStorage.getItem('token');
            api.get(`/admin/rooms/theater/${selectedTheaterId}`, { headers: { Authorization: `Bearer ${token}` } })
               .then(res => setRooms(res.data));
        }
    }, [selectedTheaterId]);

    useEffect(() => {
        if (selectedRoomId) {
            const token = localStorage.getItem('token');
            api.get(`/admin/seats/room/${selectedRoomId}`, { headers: { Authorization: `Bearer ${token}` } })
               .then(res => setSeats(res.data));
        }
    }, [selectedRoomId]);

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
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.post(`/admin/bookings/checkin/${id}`, {}, authHeader);
            alert(`✅ Vé #${id}: ${res.data}`);
            setManualTicketId('');
        } catch (err) {
            alert("❌ Thất bại: " + (err.response?.data || "Mã vé không tồn tại hoặc đã sử dụng!"));
        }
    };

    const saveOrUpdateMovie = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            
            const processedForm = {
                ...movieForm,
                status: parseInt(movieForm.status, 10),
                duration: !movieForm.duration || parseInt(movieForm.duration, 10) <= 0 ? 1 : parseInt(movieForm.duration, 10),
                releaseDate: movieForm.releaseDate ? movieForm.releaseDate : new Date().toISOString().split('T')[0]
            };

            if (editingMovieId) {
                await api.put(`/movies/admin/update/${editingMovieId}`, processedForm, authHeader);
                alert("Cập nhật thông tin phim thành công!");
            } else {
                await api.post('/movies/admin/create', processedForm, authHeader);
                alert("Thêm phim mới vào kho thành công!");
            }
            setEditingMovieId(null);
            setMovieForm({ title: '', description: '', trailerUrl: '', movieFormat: '2D', status: '1', duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: '' });
            loadTabValues();
        } catch (err) { 
            alert("Lỗi xử lý phim: " + (err.response?.data || err.message)); 
        }
    };

    const triggerEditMovie = (m) => {
        setEditingMovieId(m.movieId);
        setMovieForm({ 
            ...m,
            status: m.status !== undefined && m.status !== null ? String(m.status) : '1'
        });
    };

    const deleteMovieObj = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bộ phim này khỏi danh mục không?")) return;
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/movies/admin/delete/${id}`, authHeader);
            alert("Đã xóa phim thành công!");
            loadTabValues();
        } catch (err) { alert("Lỗi hệ thống: Phim đã có lịch chiếu không thể xóa!"); }
    };

    const createNewRoomAndSeats = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) return alert("Vui lòng chọn Rạp cần thêm phòng!");
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post(`/admin/rooms/create/${selectedTheaterId}`, roomForm, authHeader);
            alert("Khởi tạo phòng và sinh ma trận ghế tự động thành công!");
            setRoomForm({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
            api.get(`/admin/rooms/theater/${selectedTheaterId}`, authHeader).then(res => setRooms(res.data));
        } catch (err) { alert("Lỗi tạo phòng: " + err.response?.data); }
    };

    const toggleSeatMaintenance = async (seatId) => {
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/admin/seats/toggle-status/${seatId}`, {}, authHeader);
            setSeats(seats.map(s => s.seatId === seatId ? { ...s, isOccupied: !s.isOccupied } : s));
        } catch (err) { alert("Lỗi khóa ghế!"); }
    };

    const createShowtimeObj = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/admin/showtimes/create', stForm, authHeader);
            alert("Tạo lịch chiếu phim thành công!");
            setStForm({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
            loadTabValues();
        } catch (err) { alert("Lỗi tạo suất: " + err.response?.data); }
    };

    const saveVoucherObj = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/admin/vouchers/create', voucherForm, authHeader);
            alert("Phát hành Voucher quà tặng thành công!");
            setVoucherForm({ voucherCode: '', discountPercent: 10, expiryDate: '' });
            loadTabValues();
        } catch (err) { alert("Lỗi Voucher: " + err.response?.data); }
    };

    const deleteVoucherObj = async (code) => {
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/admin/vouchers/delete/${code}`, authHeader);
            loadTabValues();
        } catch (err) { alert("Lỗi xóa voucher"); }
    };

    return (
        <div className="admin-layout">
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
            
            <main className="admin-main-viewport">
                {loading && <div className="loading-spinner-overlay">Đang tải dữ liệu hệ thống...</div>}
                
                {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
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
                {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
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