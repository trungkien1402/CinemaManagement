import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';

// Import trực tiếp file CSS thường, không dùng biến styles
import '../style/Admin.css';

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
        status: '1', 
        duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: ''
    });
    const [roomForm, setRoomForm] = useState({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
    const [stForm, setStForm] = useState({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
    
    const [voucherForm, setVoucherForm] = useState({ 
        voucherCode: '', 
        discountType: 'PERCENT', 
        discountValue: '', 
        maxUses: '', 
        expiryDate: '' 
    });

    // Hàm tạo Header chứa Token nhanh
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Hàm load dữ liệu được tách biệt và tối ưu hóa để có thể gọi thủ công hoặc tự động gọi lại ngầm
    const loadTabValues = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true); // Nếu là quét ngầm thì không hiện màn hình loading đen gây khó chịu
        try {
            const authHeader = getAuthHeader();
            
            if (activeTab === 'analytics') {
                const res = await api.get('/admin/showtimes-dashboard/summary', authHeader);
                setAnalytics(res.data);
            } else if (activeTab === 'movies') {
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
                // ĐỒNG BỘ ĐƯỜNG DẪN CHUẨN VỚI CONTROLLER JAVA: /api/admin/vouchers/all
                const res = await api.get('/admin/vouchers/all', authHeader);
                setVouchers(res.data); 
            }
        } catch (err) {
            console.error("Lỗi đồng bộ dữ liệu: ", err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [activeTab]);

    // 1. Chạy lần đầu khi nhấn đổi Tab
    useEffect(() => {
        loadTabValues(false);
    }, [loadTabValues]);

    // 2. CƠ CHẾ KHẮC PHỤC LỖI: Tự động đồng bộ ngầm dữ liệu (Mã voucher, nhật ký vé) mỗi 5 giây
    useEffect(() => {
        if (activeTab === 'vouchers' || activeTab === 'bookings' || activeTab === 'analytics') {
            const intervalId = setInterval(() => {
                loadTabValues(true); // Truyền true để update ngầm mượt mà
            }, 5000);

            return () => clearInterval(intervalId); // Hủy lệnh quét khi người quản trị thoát khỏi Tab
        }
    }, [activeTab, loadTabValues]);

    useEffect(() => {
        if (selectedTheaterId) {
            api.get(`/admin/rooms/theater/${selectedTheaterId}`, getAuthHeader())
               .then(res => setRooms(res.data));
        }
    }, [selectedTheaterId]);

    useEffect(() => {
        if (selectedRoomId) {
            api.get(`/admin/seats/room/${selectedRoomId}`, getAuthHeader())
               .then(res => setSeats(res.data));
        }
    }, [selectedRoomId]);

    const fireConfirmCheckin = async (id) => {
        if (!id) return alert("Vui lòng nhập mã Ticket ID");
        try {
            const res = await api.post(`/admin/bookings/checkin/${id}`, {}, getAuthHeader());
            alert(`✅ Vé #${id}: ${res.data}`);
            setManualTicketId('');
        } catch (err) {
            alert("❌ Thất bại: " + (err.response?.data || "Mã vé không tồn tại hoặc đã sử dụng!"));
        }
    };

    const saveOrUpdateMovie = async (e) => {
        e.preventDefault();
        try {
            const authHeader = getAuthHeader();
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
            loadTabValues(false);
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
            await api.delete(`/movies/admin/delete/${id}`, getAuthHeader());
            alert("Đã xóa phim thành công!");
            loadTabValues(false);
        } catch (err) { alert("Lỗi hệ thống: Phim đã có lịch chiếu không thể xóa!"); }
    };

    const toggleSeatMaintenance = async (seatId) => {
        try {
            await api.put(`/admin/seats/toggle-status/${seatId}`, {}, getAuthHeader());
            setSeats(seats.map(s => s.seatId === seatId ? { ...s, isOccupied: !s.isOccupied } : s));
        } catch (err) { alert("Lỗi khóa ghế!"); }
    };

    const createShowtimeObj = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/showtimes/create', stForm, getAuthHeader());
            alert("Tạo lịch chiếu phim thành công!");
            setStForm({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
            loadTabValues(false);
        } catch (err) { alert("Lỗi tạo suất: " + err.response?.data); }
    };

    const saveVoucherObj = async (e) => {
        e.preventDefault();
        try {
            // ĐỒNG BỘ ĐƯỜNG DẪN CHUẨN VỚI CONTROLLER JAVA: /api/admin/vouchers/create
            await api.post('/admin/vouchers/create', voucherForm, getAuthHeader());
            alert("Phát hành Voucher quà tặng thành công!");
            
            setVoucherForm({ 
                voucherCode: '', 
                discountType: 'PERCENT', 
                discountValue: '', 
                maxUses: '', 
                expiryDate: '' 
            });
            loadTabValues(false);
        } catch (err) { alert("Lỗi Voucher: " + (err.response?.data || err.message)); }
    };

    const deleteVoucherObj = async (code) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá ${code}?`)) return;
        try {
            // ĐỒNG BỘ ĐƯỜNG DẪN CHUẨN VỚI CONTROLLER JAVA: /api/admin/vouchers/delete/{code}
            await api.delete(`/admin/vouchers/delete/${code}`, getAuthHeader());
            alert("Xóa voucher thành công!");
            loadTabValues(false);
        } catch (err) { alert("Lỗi xóa voucher: " + (err.response?.data || err.message)); }
    };

    return (
        <div className="admin-layout">
            {/* SIDEBAR BÊN TRÁI */}
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
            
            {/* KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
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
                        api={api}
                        setRooms={setRooms}
                        selectedTheaterId={selectedTheaterId} setSelectedTheaterId={setSelectedTheaterId} 
                        setSelectedRoomId={setSelectedRoomId} setSeats={setSeats} theaters={theaters} 
                        roomForm={roomForm} setRoomForm={setRoomForm} 
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