import React from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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
            <h2 className="tab-title">{t('admin.adminDashboard.theatersTab.title')}</h2>
            <div className="dual-column-panel">
                
                {/* CỘT TRÁI: CẤU HÌNH VÀ THÊM MỚI PHÒNG CHIẾU */}
                <div className="form-settings-panel">

                    <h5>📍 {t('admin.adminDashboard.theatersTab.leftPanel.title')}</h5>
                    <select value={selectedTheaterId} onChange={handleTheaterChange}>
                        <option value="">{t('admin.adminDashboard.theatersTab.leftPanel.selectTheaterPlaceholder')}</option>
                        {theaters.map(tItem => (
                            <option key={tItem.theaterId} value={tItem.theaterId}>{tItem.name}</option>
                        ))}
                    </select>

                    {selectedTheaterId && (
                        <form onSubmit={createNewRoomAndSeats} className="sub-form-box">

                            <h5>🏢 {t('admin.adminDashboard.theatersTab.leftPanel.formTitle')}</h5>
                            <input 
                                type="text" 
                                placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomId')} 
                                value={roomForm.roomId || ''} 
                                onChange={e => setRoomForm({...roomForm, roomId: e.target.value})} 
                                required 
                            />
                            <input 
                                type="text" 
                                placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomNumber')} 
                                value={roomForm.roomNumber || ''} 
                                onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} 
                                required 
                            />
                            
                            <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.rowsCount')}</label>
                            <input 
                                type="number" 
                                min="1"
                                max="26"
                                value={roomForm.rowsCount || ''} 
                                onChange={e => handleNumberInputChange('rowsCount', e.target.value)} 
                                required
                            />
                            
                            <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.colsCount')}</label>
                            <input 
                                type="number" 
                                min="1"
                                max="30"
                                value={roomForm.colsCount || ''} 
                                onChange={e => handleNumberInputChange('colsCount', e.target.value)} 
                                required
                            />
                            
                            <button type="submit" className="form-submit-btn-main">
                                {t('admin.adminDashboard.theatersTab.leftPanel.buttons.submit')}
                            </button>
                        </form>
                    )}
                </div>

                {/* CỘT PHẢI: HIỂN THỊ TRỰC QUAN SƠ ĐỒ MA TRẬN GHẾ */}
                <div className="visualization-settings-panel">
                    <h5>🖥️ {t('admin.adminDashboard.theatersTab.rightPanel.title')}</h5>
                    <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                        <option value="">{t('admin.adminDashboard.theatersTab.rightPanel.selectRoomPlaceholder')}</option>
                        {rooms.map(r => (
                            <option key={r.roomId} value={r.roomId}>
                                {r.roomNumber} ({r.totalSeats || (r.rowsCount * r.colsCount)} {t('admin.adminDashboard.theatersTab.rightPanel.seatUnit')})
                            </option>
                        ))}
                    </select>

                    {selectedRoomId && (
                        <div style={{ marginTop: '20px' }}>
                            <div className="cinema-screen-bar">{t('admin.adminDashboard.theatersTab.rightPanel.screenBar')}</div>
                            
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
                                        title={`${t('admin.adminDashboard.theatersTab.rightPanel.seatTitle.code')}: ${s.seatNumber} \n${t('admin.adminDashboard.theatersTab.rightPanel.seatTitle.hint')}`}
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
                                <span className="legend-item"><span className="box normal"></span> {t('admin.adminDashboard.theatersTab.rightPanel.legends.normal')}</span>
                                <span className="legend-item"><span className="box vip"></span> {t('admin.adminDashboard.theatersTab.rightPanel.legends.vip')}</span>
                                <span className="legend-item"><span className="box locked"></span> {t('admin.adminDashboard.theatersTab.rightPanel.legends.locked')}</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TheatersTab;