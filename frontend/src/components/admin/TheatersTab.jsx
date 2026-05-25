import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/TheatersTab.css';

const TheatersTab = () => {
    // State form thêm rạp
    const [theaterId, setTheaterId] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    // State danh sách tổng
    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [seats, setSeats] = useState([]);

    // State quản lý bộ lọc phân cấp (Rạp -> Phòng)
    const [selectedTheaterId, setSelectedTheaterId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');

    // State form thêm phòng mới
    const [inputRoomId, setInputRoomId] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [rowsCount, setRowsCount] = useState(8);
    const [colsCount, setColsCount] = useState(10);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Khi bật trang, lấy ngay danh sách rạp
    useEffect(() => {
        fetchTheaters();
    }, []);

    // Khi người dùng đổi cụm rạp -> Tự động load danh sách phòng của rạp đó
    useEffect(() => {
        if (selectedTheaterId) {
            fetchRoomsByTheater(selectedTheaterId);
            setSeats([]); // Xóa sơ đồ cũ đi để chờ chọn phòng mới
            setSelectedRoomId('');
        } else {
            setRooms([]);
            setSeats([]);
        }
    }, [selectedTheaterId]);

    // Khi người dùng chọn phòng cụ thể -> Hiện ma trận ghế của phòng đó lên
    useEffect(() => {
        if (selectedRoomId) {
            fetchSeatsByRoom(selectedRoomId);
        } else {
            setSeats([]);
        }
    }, [selectedRoomId]);

    const fetchTheaters = async () => {
        try {
            const token = localStorage.getItem('token'); 
            const response = await axios.get('http://localhost:8080/api/admin/theaters/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTheaters(response.data);
            if (response.data.length > 0 && !selectedTheaterId) {
                setSelectedTheaterId(response.data[0].theaterId);
            }
        } catch (error) {
            console.error("Lỗi tải rạp:", error);
        }
    };

    const fetchRoomsByTheater = async (tId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/admin/rooms/theater/${tId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách phòng:", error);
        }
    };

    const fetchSeatsByRoom = async (rId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/admin/seats/room/${rId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSeats(response.data);
        } catch (error) {
            console.error("Lỗi tải sơ đồ ghế:", error);
        }
    };

    const handleAddTheater = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const payload = {
                theaterId: theaterId.trim().toUpperCase(),
                name: name.trim(),
                location: location.trim(),
                city: city.trim(),
                phone: phone.trim(),
                operatingHours: "08:00 - 23:30"
            };
            await axios.post('http://localhost:8080/api/admin/theaters/create', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: `Đã lưu cụm rạp "${payload.name}"!` });
            setTheaterId(''); setName(''); setLocation(''); setCity(''); setPhone('');
            fetchTheaters();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || "Lỗi thêm cụm rạp!" });
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) {
            setMessage({ type: 'error', text: 'Vui lòng chọn cụm rạp cần thêm phòng trước!' });
            return;
        }
        if (inputRoomId.trim().length > 3) {
            setMessage({ type: 'error', text: 'Mã phòng nhập ngắn gọn (VD: P1, P2) để tối ưu hóa bộ nhớ!' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            roomId: inputRoomId.trim().toUpperCase(),
            roomNumber: roomNumber.trim(),
            rowsCount: parseInt(rowsCount),
            colsCount: parseInt(colsCount)
        };

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8080/api/admin/rooms/create/${selectedTheaterId}`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: response.data });
            setInputRoomId('');
            setRoomNumber('');
            
            await fetchRoomsByTheater(selectedTheaterId);
            
            const targetRoomSystemId = `${selectedTheaterId}-${payload.roomId}`;
            setSelectedRoomId(targetRoomSystemId);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || "Lỗi tạo phòng!" });
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = async (seatId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/admin/seats/change-type/${seatId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSeats(seats.map(s => s.seatId === seatId ? response.data : s));
        } catch (error) {
            console.error("Lỗi cập nhật loại ghế:", error);
        }
    };

    return (
        <div className="thtab-container">
            <h2 className="thtab-main-title">Hệ Thống Quản Trị Cụm Rạp & Thiết Kế Ghế Sơ Đồ</h2>

            {message.text && (
                <div className={`thtab-alert ${message.type === 'success' ? 'success' : 'error'}`}>
                    {message.text}
                </div>
            )}

            {/* BLOCK 1: THÊM CỤM RẠP CHIẾU */}
            <div className="thtab-card">
                <h3 className="thtab-card-title title-green">➕ THÊM CỤM RẠP CHIẾU MỚI</h3>
                <form onSubmit={handleAddTheater} className="thtab-form-grid">
                    <div className="thtab-form-item">
                        <label>Mã Rạp (VD: T01):</label>
                        <input type="text" value={theaterId} onChange={(e) => setTheaterId(e.target.value)} placeholder="Viết liền không dấu" required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Tên Rạp:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: CGV Nguyễn Trãi" required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Thành Phố:</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="VD: Đà Nẵng" required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Địa Chỉ Chi Tiết:</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Số nhà, Tên đường..." required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Hotline Rạp:</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" required />
                    </div>
                    <div className="thtab-form-item thtab-btn-align-bottom">
                        <button type="submit" className="thtab-btn submit green">Lưu Cụm Rạp</button>
                    </div>
                </form>
            </div>

            {/* BLOCK 2: KHỞI TẠO PHÒNG CHIẾU CHO RẠP ĐANG CHỌN */}
            <div className="thtab-card">
                <h3 className="thtab-card-title title-red">⚙️ THÊM PHÒNG CHIẾU VÀO RẠP ĐANG CHỌN</h3>
                
                <div className="thtab-target-bar">
                    <label>📍 Bước 1 - Chọn cụm rạp mục tiêu: </label>
                    <select value={selectedTheaterId} onChange={(e) => setSelectedTheaterId(e.target.value)}>
                        <option value="">-- Click chọn rạp chiếu --</option>
                        {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name} ({t.city})</option>)}
                    </select>
                </div>

                <form onSubmit={handleCreateRoom} className="thtab-form-grid">
                    <div className="thtab-form-item">
                        <label>Mã phòng độc lập (VD: P1, P2):</label>
                        <input type="text" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} placeholder="Tối đa 3 chữ" required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Tên hiển thị phòng:</label>
                        <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="VD: Phòng Chiếu IMAX 01" required />
                    </div>
                    <div className="thtab-form-item">
                        <label>Số hàng dọc (A-Z):</label>
                        <input type="number" value={rowsCount} onChange={(e) => setRowsCount(e.target.value)} />
                    </div>
                    <div className="thtab-form-item">
                        <label>Số cột ngang (1-20):</label>
                        <input type="number" value={colsCount} onChange={(e) => setColsCount(e.target.value)} />
                    </div>
                    <div className="thtab-form-item thtab-btn-align-bottom">
                        <button type="submit" disabled={loading} className="thtab-btn submit red">
                            {loading ? 'Đang tạo...' : 'Tạo Sơ Đồ Phòng Cho Rạp'}
                        </button>
                    </div>
                </form>
            </div>

            {/* BLOCK 3: BỘ LỌC ĐỂ XEM VÀ CHỈNH SỬA SƠ ĐỒ GHẾ CỦA TỪNG PHÒNG THỰC TẾ */}
            <div className="thtab-card">
                <h3 className="thtab-card-title title-blue">🔍 TRÌNH QUẢN LÝ SƠ ĐỒ GHẾ THEO PHÒNG</h3>
                <div className="thtab-filter-row">
                    <div className="thtab-filter-item">
                        <label>1. Chọn cụm rạp phim:</label>
                        <select value={selectedTheaterId} onChange={(e) => setSelectedTheaterId(e.target.value)}>
                            <option value="">-- Chọn rạp phim --</option>
                            {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="thtab-filter-item">
                        <label>2. Chọn phòng chiếu (Chỉ hiện phòng của rạp trên):</label>
                        <select 
                            value={selectedRoomId} 
                            onChange={(e) => setSelectedRoomId(e.target.value)} 
                            disabled={rooms.length === 0} 
                            className={rooms.length === 0 ? 'disabled' : ''}
                        >
                            <option value="">-- Chọn phòng xem sơ đồ --</option>
                            {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber} (Mã gốc: {r.roomId})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* BẢN ĐỒ MA TRẬN GHẾ NƠI CÓ THỂ TỰ CHỈNH SỬA VÀ LƯU TRỰC TIẾP */}
            {seats.length > 0 && (
                <div className="thtab-matrix-card">
                    <div className="thtab-screen-line"></div>
                    <p className="thtab-screen-text">MÀN HÌNH CHÍNH TẠI PHÒNG</p>
                    <p className="thtab-note-success">✓ Dữ liệu đã lưu vĩnh viễn! Click tự do vào từng ghế để cập nhật lại cấu trúc (Thường ➔ VIP ➔ Đôi)</p>

                    <div 
                        className="thtab-seats-layout" 
                        style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(42px, 55px))` }}
                    >
                        {seats.map(s => {
                            const type = s.seatType ? s.seatType.toUpperCase() : 'NORMAL';
                            let classType = 'normal';

                            if (type === 'VIP') {
                                classType = 'vip';
                            } else if (type === 'DOUBLE') {
                                classType = 'double';
                            }

                            return (
                                <button
                                    key={s.seatId}
                                    type="button"
                                    onClick={() => handleSeatClick(s.seatId)}
                                    className={`thtab-seat-btn ${classType}`}
                                >
                                    {s.seatNumber}
                                </button>
                            );
                        })}
                    </div>

                    <div className="thtab-legend">
                        <span className="thtab-legend-item"><span className="thtab-legend-box normal"></span> Thường</span>
                        <span className="thtab-legend-item"><span className="thtab-legend-box vip"></span> VIP</span>
                        <span className="thtab-legend-item"><span className="thtab-legend-box double"></span> Ghế đôi</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TheatersTab;