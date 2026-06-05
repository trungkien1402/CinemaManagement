import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../style/TheatersTab.css';
//import Icon
import addIcon from '../../assets/add.png';
import settingIcon from '../../assets/setting.png';
import addressIcon from '../../assets/cinema address.png';
import searchIcon from '../../assets/search.png';
const TheatersTab = () => {
    const { t } = useTranslation();

    // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
    const [theaterId, setTheaterId] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    const [theaters, setTheaters] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [seats, setSeats] = useState([]);

    const [selectedTheaterId, setSelectedTheaterId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');

    const [inputRoomId, setInputRoomId] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [rowsCount, setRowsCount] = useState(8);
    const [colsCount, setColsCount] = useState(10);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- EFFECT LIFECYCLE VÀ CALL API ---
    useEffect(() => {
        fetchTheaters();
    }, []);

    useEffect(() => {
        if (selectedTheaterId) {
            fetchRoomsByTheater(selectedTheaterId);
            setSeats([]); 
            setSelectedRoomId('');
        } else {
            setRooms([]);
            setSeats([]);
        }
    }, [selectedTheaterId]);

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
            console.error("Error loading theaters:", error);
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
            console.error("Error loading rooms:", error);
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
            console.error("Error loading seats matrix:", error);
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
            setMessage({
                type: 'success',
                text: t('admin.adminDashboard.alerts.theaterCreateSuccess', { name: payload.name }) || `Saved theater complex "${payload.name}"!`
            });
            setTheaterId(''); setName(''); setLocation(''); setCity(''); setPhone('');
            fetchTheaters();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data || t('admin.adminDashboard.alerts.theaterCreateError') || "Error adding cinema complex!"
            });
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!selectedTheaterId) {
            setMessage({ type: 'error', text: t('admin.adminDashboard.alerts.requireTheaterForRoom') || 'Please select a theater complex first!' });
            return;
        }
        if (inputRoomId.trim().length > 3) {
            setMessage({ type: 'error', text: t('admin.adminDashboard.alerts.roomIdTooLong') || 'Room ID should be short (e.g., P1, P2) for memory optimization!' });
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

            // Nếu BE trả về chuỗi text thuần, ta hiển thị response.data hoặc text fallback i18n
            setMessage({ type: 'success', text: t('admin.adminDashboard.alerts.roomCreateSuccess') || response.data });
            setInputRoomId('');
            setRoomNumber('');

            await fetchRoomsByTheater(selectedTheaterId);

            const targetRoomSystemId = `${selectedTheaterId}-${payload.roomId}`;
            setSelectedRoomId(targetRoomSystemId);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || t('admin.adminDashboard.alerts.roomError') || "Error creating room!" });
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
            console.error("Error updating seat type:", error);
            alert(t('admin.adminDashboard.alerts.seatError') || "Error changing seat type status!");
        }
    };

    const currentRoomObj = rooms.find(r => r.roomId === selectedRoomId);
    const dynamicCols = currentRoomObj?.colsCount || colsCount || 10;

    return (
        <div className="thtab-container tab-view">
            <h2 className="thtab-main-title tab-title">
                {t('admin.adminDashboard.theatersTab.title') || "Hệ Thống Quản Trị Cụm Rạp & Thiết Kế Ghế Sơ Đồ"}
            </h2>

            {message.text && (
                <div className={`thtab-alert ${message.type === 'success' ? 'success' : 'error'}`}>
                    {message.text}
                </div>
            )}

            {/* BLOCK 1: THÊM CỤM RẠP CHIẾU MỚI */}
            <div className="thtab-card">
                <h3 className="thtab-card-title title-green">
    <img src={addIcon} alt="Add" className="nav-icon" /> 
    {t('admin.adminDashboard.theatersTab.addTheater.title') || "THÊM CỤM RẠP CHIẾU MỚI"}
</h3>
                <form onSubmit={handleAddTheater} className="thtab-form-grid">
                    <div className="thtab-form-item">
                        <label>{t('admin.adminDashboard.theatersTab.addTheater.labels.cinemaId') || "Mã Rạp (VD: T01):"}</label>
                        <input type="text" value={theaterId} onChange={(e) => setTheaterId(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.addTheater.placeholders.cinemaId') || "Viết liền không dấu"} required />
                    </div>
                    <div className="thtab-form-item">
                        <label>{t('admin.adminDashboard.theatersTab.addTheater.labels.cinemaName') || "Tên Rạp:"}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.addTheater.placeholders.cinemaName') || "VD: CGV Nguyễn Trãi"} required />
                    </div>
                    <div className="thtab-form-item">
                        <label>{t('admin.adminDashboard.theatersTab.addTheater.labels.city') || "Thành Phố:"}</label>
                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.addTheater.placeholders.city') || "VD: Đà Nẵng"} required />
                    </div>
                    <div className="thtab-form-item">
                        <label>{t('admin.adminDashboard.theatersTab.addTheater.labels.address') || "Địa Chỉ Chi Tiết:"}</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.addTheater.placeholders.address') || "Số nhà, Tên đường..."} required />
                    </div>
                    <div className="thtab-form-item">
                        <label>{t('admin.adminDashboard.theatersTab.addTheater.labels.hotline') || "Hotline Rạp:"}</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.addTheater.placeholders.hotline') || "Số điện thoại"} required />
                    </div>
                    <div className="thtab-form-item thtab-btn-align-bottom">
                        <button type="submit" className="thtab-btn submit green">
                            {t('admin.adminDashboard.theatersTab.addTheater.buttons.save') || "Lưu Cụm Rạp"}
                        </button>
                    </div>
                </form>
            </div>

            {/* DUAL COLUMN PANEL */}
            <div className="dual-column-panel">

                {/* CỘT TRÁI: KHỞI TẠO PHÒNG CHIẾU */}
                <div className="form-settings-panel thtab-card">
                   <h3 className="thtab-card-title title-red">
    <img src={settingIcon} alt="Setting" className="nav-icon" /> 
    {t('admin.adminDashboard.theatersTab.leftPanel.formTitle') || "THÊM PHÒNG CHIẾU"}
</h3>

                    <div className="thtab-target-bar" style={{ marginBottom: '15px' }}>
                       <label>
    <img src={addressIcon} alt="Address" className="nav-icon" /> 
    {t('admin.adminDashboard.theatersTab.leftPanel.title') || "Bước 1 - Chọn cụm rạp mục tiêu:"} 
</label>
                        <select value={selectedTheaterId} onChange={(e) => setSelectedTheaterId(e.target.value)}>
                            <option value="">{t('admin.adminDashboard.theatersTab.leftPanel.selectTheaterPlaceholder') || "-- Click chọn rạp chiếu --"}</option>
                            {theaters.map(tItem => (
                                <option key={tItem.theaterId} value={tItem.theaterId}>{tItem.name} ({tItem.city})</option>
                            ))}
                        </select>
                    </div>

                    {selectedTheaterId && (
                        <form onSubmit={handleCreateRoom} className="sub-form-box thtab-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label>{t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomId') || "Mã phòng độc lập (VD: P1, P2):"}</label>
                                <input type="text" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomIdPlaceholder') || "Tối đa 3 chữ"} required />
                            </div>
                            <div>
                                <label>{t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomNumber') || "Tên hiển thị phòng:"}</label>
                                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomNumberPlaceholder') || "VD: Phòng Chiếu IMAX 01"} required />
                            </div>
                            <div>
                                <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.rowsCount') || "Số hàng dọc (A-Z):"}</label>
                                <input type="number" min="1" max="26" value={rowsCount} onChange={(e) => setRowsCount(e.target.value)} required />
                            </div>
                            <div>
                                <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.colsCount') || "Số cột ngang (1-30):"}</label>
                                <input type="number" min="1" max="30" value={colsCount} onChange={(e) => setColsCount(e.target.value)} required />
                            </div>

                            <button type="submit" disabled={loading} className="thtab-btn submit red form-submit-btn-main" style={{ marginTop: '10px' }}>
                                {loading ? t('admin.adminDashboard.theatersTab.leftPanel.buttons.loading') || 'Đang tạo...' : t('admin.adminDashboard.theatersTab.leftPanel.buttons.submit')}
                            </button>
                        </form>
                    )}
                </div>

                {/* CỘT PHẢI: TRÌNH QUẢN LÝ MA TRẬN GHẾ TRỰC QUAN */}
                <div className="visualization-settings-panel thtab-card">
                  <h3 className="thtab-card-title title-blue">
    <img src={searchIcon} alt="Search" className="nav-icon" /> 
    {t('admin.adminDashboard.theatersTab.rightPanel.title') || "TRÌNH QUẢN LÝ SƠ ĐỒ GHẾ THEO PHÒNG"}
</h3>

                    <div className="thtab-filter-row" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>{t('admin.adminDashboard.theatersTab.rightPanel.selectRoomPlaceholder') || "Chọn phòng xem sơ đồ:"}</label>
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            disabled={rooms.length === 0}
                            className={rooms.length === 0 ? 'disabled' : ''}
                        >
                            <option value="">{t('admin.adminDashboard.theatersTab.rightPanel.selectRoomOptionNone') || "-- Chọn phòng --"}</option>
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>
                                    {r.roomNumber} ({r.totalSeats || (r.rowsCount * r.colsCount)} {t('admin.adminDashboard.theatersTab.rightPanel.seatUnit') || "ghế"})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedRoomId && seats.length > 0 && (
                        <div className="thtab-matrix-card" style={{ marginTop: '20px' }}>
                            <div className="cinema-screen-bar thtab-screen-line"></div>
                            <p className="thtab-screen-text" style={{ textAlign: 'center', margin: '5px 0 15px', fontWeight: 'bold', color: '#a0aec0' }}>
                                {t('admin.adminDashboard.theatersTab.rightPanel.screenBar') || "MÀN HÌNH CHÍNH TẠI PHÒNG"}
                            </p>

                            <p className="thtab-note-success" style={{ fontSize: '12px', color: '#48bb78', fontStyle: 'italic', marginBottom: '10px', textAlign: 'center' }}>
                                {t('admin.adminDashboard.theatersTab.rightPanel.hintText') || "✓ Click tự do vào từng ghế để đổi loại cấu trúc (Thường ➔ VIP ➔ Đôi)"}
                            </p>

                            <div 
                                className="thtab-seats-layout seats-matrix-grid-display"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${dynamicCols}, minmax(35px, 1fr))`,
                                    gap: '8px',
                                    justifyContent: 'center',
                                    padding: '15px',
                                    background: '#1a1d24',
                                    borderRadius: '8px',
                                    overflowX: 'auto'
                                }}
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
                                            className={`thtab-seat-btn seat-node ${classType} ${s.isOccupied ? 'maintenance-lock' : ''}`}
                                            title={`${t('admin.adminDashboard.theatersTab.rightPanel.seatTitle.code') || "Mã"}: ${s.seatNumber}`}
                                            style={{
                                                padding: '8px 0',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {s.seatNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dòng chú thích ý nghĩa màu sắc của ghế */}
                            <div className="thtab-legend legend-row" style={{ marginTop: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <span className="thtab-legend-item legend-item">
                                    <span className="thtab-legend-box box normal"></span> 
                                    {t('admin.adminDashboard.theatersTab.rightPanel.legends.normal') || "Thường"}
                                </span>
                                <span className="thtab-legend-item legend-item">
                                    <span className="thtab-legend-box box vip"></span> 
                                    {t('admin.adminDashboard.theatersTab.rightPanel.legends.vip') || "VIP"}
                                </span>
                                <span className="thtab-legend-item legend-item">
                                    <span className="thtab-legend-box box double locked"></span> 
                                    {t('admin.adminDashboard.theatersTab.rightPanel.legends.locked') || "Ghế đôi / Bảo trì"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TheatersTab;