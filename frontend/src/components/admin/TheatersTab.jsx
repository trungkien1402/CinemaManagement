import React from 'react';

const TheatersTab = ({ selectedTheaterId, setSelectedTheaterId, setSelectedRoomId, setSeats, theaters, createNewRoomAndSeats, roomForm, setRoomForm, selectedRoomId, rooms, seats, toggleSeatMaintenance }) => {
    return (
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
    );
};

export default TheatersTab;