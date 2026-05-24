import React from 'react';

const TheatersTab = ({ 
    selectedTheaterId, 
    setSelectedTheaterId, 
    setSelectedRoomId, 
    setSeats, 
    theaters, 
    createNewRoomAndSeats, 
    roomForm, 
    setRoomForm, 
    selectedRoomId, 
    rooms, 
    seats, 
    toggleSeatMaintenance 
}) => {

    // ✅ LOGIC CẢI TIẾN: Tính toán số cột động dựa trên phòng đang chọn để căn chỉnh ma trận CSS Grid
    const currentRoom = rooms.find(r => String(r.roomId) === String(selectedRoomId));
    // Nếu có thông tin phòng từ DB thì lấy số cột của phòng đó, không thì lấy số cột tạm tính từ form (mặc định tối thiểu 1)
    const dynamicCols = currentRoom && currentRoom.colsCount ? currentRoom.colsCount : (roomForm.colsCount || 10);

    const handleTheaterChange = (e) => {
        const id = e.target.value;
        setSelectedTheaterId(id);
        setSelectedRoomId(''); // Khử phòng đang chọn cũ
        setSeats([]);          // Xóa sạch mảng ghế tránh hiện tượng "rác" UI
    };

    const handleNumberInputChange = (field, value) => {
        const parsedValue = parseInt(value, 10);
        // Ngăn chặn nhập số âm hoặc số 0 gây hỏng ma trận vòng lặp
        setRoomForm({
            ...roomForm,
            [field]: isNaN(parsedValue) || parsedValue <= 0 ? 1 : parsedValue
        });
    };

    return (
        <div className="tab-view">
            <h2 className="tab-title">Hệ Thống Hạ Tầng Cụm Rạp</h2>
            <div className="dual-column-panel">
                
                {/* CỘT TRÁI: CẤU HÌNH VÀ THÊM MỚI PHÒNG CHIẾU */}
                <div className="form-settings-panel">
                    <h5>📍 Chọn vị trí Cụm Rạp</h5>
                    <select value={selectedTheaterId} onChange={handleTheaterChange}>
                        <option value="">-- Chọn danh sách rạp chiếu --</option>
                        {theaters.map(t => (
                            <option key={t.theaterId} value={t.theaterId}>{t.name}</option>
                        ))}
                    </select>

                    {selectedTheaterId && (
                        <form onSubmit={createNewRoomAndSeats} className="sub-form-box">
                            <h5>🏢 Thêm phòng chiếu mới & Sinh ghế tự động</h5>
                            <input 
                                type="text" 
                                placeholder="Mã phòng (Ví dụ: P01_RAP_A)" 
                                value={roomForm.roomId || ''} 
                                onChange={e => setRoomForm({...roomForm, roomId: e.target.value})} 
                                required 
                            />
                            <input 
                                type="text" 
                                placeholder="Tên phòng hiển thị (Ví dụ: Phòng Số 1)" 
                                value={roomForm.roomNumber || ''} 
                                onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} 
                                required 
                            />
                            
                            <label>Số hàng ghế vật lý (A-Z):</label>
                            <input 
                                type="number" 
                                min="1"
                                max="26"
                                value={roomForm.rowsCount || ''} 
                                onChange={e => handleNumberInputChange('rowsCount', e.target.value)} 
                                required
                            />
                            
                            <label>Số ghế trên mỗi hàng:</label>
                            <input 
                                type="number" 
                                min="1"
                                max="30"
                                value={roomForm.colsCount || ''} 
                                onChange={e => handleNumberInputChange('colsCount', e.target.value)} 
                                required
                            />
                            
                            <button type="submit" className="form-submit-btn-main">
                                Khởi Tạo & Cấu Hình Sơ Đồ Ghế
                            </button>
                        </form>
                    )}
                </div>

                {/* CỘT PHẢI: HIỂN THỊ TRỰC QUAN SƠ ĐỒ MA TRẬN GHẾ */}
                <div className="visualization-settings-panel">
                    <h5>🖥️ Sơ đồ thiết kế phòng ghế vật lý</h5>
                    <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                        <option value="">-- Chọn phòng chiếu hiển thị sơ đồ --</option>
                        {rooms.map(r => (
                            <option key={r.roomId} value={r.roomId}>
                                {r.roomNumber} ({r.totalSeats || (r.rowsCount * r.colsCount)} ghế)
                            </option>
                        ))}
                    </select>

                    {selectedRoomId && (
                        <div style={{ marginTop: '20px' }}>
                            <div className="cinema-screen-bar">MÀN HÌNH CHIẾU PHIM</div>
                            
                            {/* ✅ ĐÃ CẢI TIẾN LOGIC: Ép CSS gán chuẩn số cột động giúp các hàng ghế xếp thẳng tắp */}
                            <div 
                                className="seats-matrix-grid-display"
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
                                {seats.map(s => (
                                    <button
                                        key={s.seatId}
                                        type="button"
                                        onClick={() => toggleSeatMaintenance(s.seatId)}
                                        className={`seat-node ${s.seatType === 'VIP' ? 'vip' : 'normal'} ${s.isOccupied ? 'maintenance-lock' : ''}`}
                                        title={`Mã ghế: ${s.seatNumber} \nLoại: ${s.seatType} \nBấm để Khóa/Mở bảo trì`}
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
                                ))}
                            </div>

                            <div className="legend-row" style={{ marginTop: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <span className="legend-item"><span className="box normal"></span> Ghế Thường</span>
                                <span className="legend-item"><span className="box vip"></span> Ghế VIP</span>
                                <span className="legend-item"><span className="box locked"></span> Đang bảo trì (Khóa)</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TheatersTab;