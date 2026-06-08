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
import { useTranslation } from 'react-i18next'; 

const AdminDashboard = () => {
    const { t, i18n } = useTranslation(); 
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
        duration: '', genre: '', ageRating: 'P', releaseDate: '', image: '', author: '',
        imageFile: null, trailerFile: null // Thêm 2 field chứa File gốc
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

    // Ham tao Header chua Token nhanh
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Helper lay thong tin chi tiet loi tu API
    const getErrorMessage = (err) => {
        if (err.response && err.response.data) {
            if (typeof err.response.data === 'string') return err.response.data;
            if (err.response.data.message) return err.response.data.message;
            if (err.response.data.error) return err.response.data.error;
            return JSON.stringify(err.response.data);
        }
        return err.message;
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const loadTabValues = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);

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
                const res = await api.get('/admin/vouchers/all', authHeader);
                setVouchers(res.data);
            }
        } catch (err) {
            console.error("Lỗi đồng bộ dữ liệu: ", err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadTabValues(false);
    }, [loadTabValues]);

    useEffect(() => {
        if (activeTab === 'vouchers' || activeTab === 'bookings' || activeTab === 'analytics') {
            const intervalId = setInterval(() => {
                loadTabValues(true);
            }, 5000);
            return () => clearInterval(intervalId);
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
        if (!id) return alert(t('admin.adminDashboard.alerts.requireTicketId'));
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.put(`/admin/bookings/checkin/${id}`, {}, authHeader);
            alert(`✅ ${t('admin.adminDashboard.alerts.checkinSuccess') || "Vé"} #${id}: ${res.data}`);
            setManualTicketId('');
        } catch (err) {
            alert(t('admin.adminDashboard.alerts.checkinFail') + ": " + getErrorMessage(err));
        }
    };

    // =========================================================================
    // hàm gửi formdata và tự động làm mới giao diện
    // =========================================================================
    const saveOrUpdateMovie = async (e) => {
        e.preventDefault();

        // 1. Dùng FormData để gói cả chữ và File
        const formData = new FormData();

        // 2. Nhét các thông tin chữ vào
        formData.append('title', movieForm.title || '');
        formData.append('genre', movieForm.genre || '');
        formData.append('duration', movieForm.duration || 0);
        formData.append('author', movieForm.author || '');
        formData.append('movieFormat', movieForm.movieFormat || '2D');
        formData.append('ageRating', movieForm.ageRating || 'P');
        formData.append('status', movieForm.status !== undefined ? movieForm.status : 1);
        formData.append('description', movieForm.description || '');
        formData.append('releaseDate', movieForm.releaseDate || '');

        // 3. Nhét File vào
        if (movieForm.imageFile) {
            formData.append('imageFile', movieForm.imageFile);
        }
        if (movieForm.trailerFile) {
            formData.append('trailerFile', movieForm.trailerFile);
        }

        try {
            const token = localStorage.getItem('token');

            if (editingMovieId) {
                await api.put(`/movies/admin/update/${editingMovieId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Cập nhật phim thành công!");
            } else {
                await api.post('/movies/admin/create', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Thêm phim mới thành công!");
            }

            // làm mới lại danh sách phim ngầm (không xoay loading)
            loadTabValues(true);

            // reset lại toàn bộ form về trạng thái trống
            setEditingMovieId(null);
            setMovieForm({
                title: '', description: '', trailerUrl: '', movieFormat: '2D',
                status: '1', duration: '', genre: '', ageRating: 'P', releaseDate: '',
                image: '', author: '', imageFile: null, trailerFile: null
            });

        } catch (err) {
            console.error("Chi tiết lỗi khi lưu phim:", err);
            alert("Lỗi khi thêm/cập nhật phim: " + getErrorMessage(err));
        }
    };

    const triggerEditMovie = (m) => {
        setEditingMovieId(m.movieId);
        setMovieForm({
            ...m,
            status: m.status !== undefined && m.status !== null ? String(m.status) : '1',
            imageFile: null, trailerFile: null
        });
    };

    const deleteMovieObj = async (id) => {
        if (!window.confirm(t('admin.adminDashboard.alerts.confirmDeleteMovie'))) return;
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/movies/admin/delete/${id}`, authHeader);
            alert(t('admin.adminDashboard.alerts.movieDeleteSuccess') || "Đã xóa phim thành công!");
            loadTabValues(true); // Cập nhật ngầm
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.movieDeleteFail') || "Xóa phim thất bại!") + "\nChi tiết: " + getErrorMessage(err)); 
        }
    };

    const createNewRoomAndSeats = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) return alert(t('admin.adminDashboard.alerts.requireTheaterForRoom'));
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post(`/admin/rooms/create/${selectedTheaterId}`, roomForm, authHeader);
            alert(t('admin.adminDashboard.alerts.roomCreateSuccess') || "Khởi tạo phòng thành công!");
            setRoomForm({ roomId: '', roomNumber: '', rowsCount: 8, colsCount: 10 });
            api.get(`/admin/rooms/theater/${selectedTheaterId}`, authHeader).then(res => setRooms(res.data));
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.roomError') || "Lỗi tạo phòng: ") + getErrorMessage(err)); 
        }
    };

    const toggleSeatMaintenance = async (seatId) => {
        try {
            await api.put(`/admin/seats/toggle-status/${seatId}`, {}, getAuthHeader());
            setSeats(seats.map(s => s.seatId === seatId ? { ...s, isOccupied: !s.isOccupied } : s));
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.seatError') || "Lỗi thay đổi trạng thái ghế: ") + getErrorMessage(err)); 
        }
    };

    const createShowtimeObj = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/admin/showtimes/create', stForm, authHeader);
            alert(t('admin.adminDashboard.alerts.showtimeCreateSuccess') || "Tạo lịch chiếu phim thành công!");
            setStForm({ movieId: '', roomId: '', showDate: '', startTime: '', ticketPrice: 85000 });
            loadTabValues(true);
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.showtimeError') || "Lỗi tạo lịch chiếu: ") + getErrorMessage(err)); 
        }
    };

    const saveVoucherObj = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.post('/admin/vouchers/create', voucherForm, authHeader);
            alert(t('admin.adminDashboard.alerts.voucherCreateSuccess') || "Phát hành Voucher thành công!");
            setVoucherForm({ voucherCode: '', discountType: 'PERCENT', discountValue: '', maxUses: '', expiryDate: '' });
            loadTabValues(true);
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.voucherError') || "Lỗi tạo voucher: ") + getErrorMessage(err)); 
        }
    };

    const deleteVoucherObj = async (code) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá ${code}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            await api.delete(`/admin/vouchers/delete/${code}`, authHeader);
            loadTabValues(true);
        } catch (err) { 
            alert((t('admin.adminDashboard.alerts.voucherDeleteError') || "Lỗi khi xóa mã voucher: ") + getErrorMessage(err)); 
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-navigation-panel">
                <div className="admin-brand">CINEMA<span>X</span></div>

                <nav className="nav-menu-list">
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                        <i className="fa-solid fa-chart-pie"></i> {t('admin.adminDashboard.tabs.analytics')}
                    </button>
                    <button className={activeTab === 'movies' ? 'active' : ''} onClick={() => setActiveTab('movies')}>
                        <i className="fa-solid fa-clapperboard"></i> {t('admin.adminDashboard.tabs.movies')}
                    </button>
                    <button className={activeTab === 'theaters' ? 'active' : ''} onClick={() => setActiveTab('theaters')}>
                        <i className="fa-solid fa-couch"></i> {t('admin.adminDashboard.tabs.theaters')}
                    </button>
                    <button className={activeTab === 'showtimes' ? 'active' : ''} onClick={() => setActiveTab('showtimes')}>
                        <i className="fa-solid fa-calendar-days"></i> {t('admin.adminDashboard.tabs.showtimes')}
                    </button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <i className="fa-solid fa-receipt"></i> {t('admin.adminDashboard.tabs.bookings')}
                    </button>
                    <button className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => setActiveTab('vouchers')}>
                        <i className="fa-solid fa-tags"></i> {t('admin.adminDashboard.tabs.vouchers')}
                    </button>
                    <button className={activeTab === 'qrcode-checkin' ? 'active' : ''} onClick={() => setActiveTab('qrcode-checkin')}>
                        <i className="fa-solid fa-qrcode"></i> {t('admin.adminDashboard.tabs.qrcodeCheckin')}
                    </button>
                    <div className="nav-divider"></div>
                    <button onClick={() => navigate('/')} className="exit-panel-btn">
                        <i className="fa-solid fa-house"></i> {t('admin.adminDashboard.tabs.backToHome')}
                    </button>
                </nav>
            </aside>

            <main className="admin-main-viewport">
                {loading && <div className="loading-spinner-overlay">{t('admin.adminDashboard.status.loading')}</div>}
                
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