import React from 'react';
import { useTranslation } from 'react-i18next';

const TheatersTab = ({ selectedTheaterId, setSelectedTheaterId, setSelectedRoomId, setSeats, theaters, createNewRoomAndSeats, roomForm, setRoomForm, selectedRoomId, rooms, seats, toggleSeatMaintenance }) => {
    const { t } = useTranslation();

    return (
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.theatersTab.title')}</h2>
            <div className="dual-column-panel">
                <div className="form-settings-panel">
                    <h5>📍 {t('admin.adminDashboard.theatersTab.leftPanel.title')}</h5>
                    <select value={selectedTheaterId} onChange={e => { setSelectedTheaterId(e.target.value); setSelectedRoomId(''); setSeats([]); }}>
                        <option value="">{t('admin.adminDashboard.theatersTab.leftPanel.selectTheaterPlaceholder')}</option>
                        {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                    </select>
                    {selectedTheaterId && (
                        <form onSubmit={createNewRoomAndSeats} className="sub-form-box">
                            <h5>🏢 {t('admin.adminDashboard.theatersTab.leftPanel.formTitle')}</h5>
                            <input type="text" placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomId')} value={roomForm.roomId} onChange={e => setRoomForm({...roomForm, roomId: e.target.value})} required />
                            <input type="text" placeholder={t('admin.adminDashboard.theatersTab.leftPanel.placeholders.roomNumber')} value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} required />
                            <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.rowsCount')}</label>
                            <input type="number" value={roomForm.rowsCount} onChange={e => setRoomForm({...roomForm, rowsCount: parseInt(e.target.value)})} />
                            <label>{t('admin.adminDashboard.theatersTab.leftPanel.labels.colsCount')}</label>
                            <input type="number" value={roomForm.colsCount} onChange={e => setRoomForm({...roomForm, colsCount: parseInt(e.target.value)})} />
                            <button type="submit" className="form-submit-btn-main">{t('admin.adminDashboard.theatersTab.leftPanel.buttons.submit')}</button>
                        </form>
                    )}
                </div>
                <div className="visualization-settings-panel">
                    <h5>🖥️ {t('admin.adminDashboard.theatersTab.rightPanel.title')}</h5>
                    <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                        <option value="">{t('admin.adminDashboard.theatersTab.rightPanel.selectRoomPlaceholder')}</option>
                        {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber} ({r.totalSeats} {t('admin.adminDashboard.theatersTab.rightPanel.seatUnit')})</option>)}
                    </select>
                    {selectedRoomId && (
                        <div>
                            <div className="cinema-screen-bar">{t('admin.adminDashboard.theatersTab.rightPanel.screenBar')}</div>
                            <div className="seats-matrix-grid-display">
                                {seats.map(s => (
                                    <button
                                        key={s.seatId}
                                        onClick={() => toggleSeatMaintenance(s.seatId)}
                                        className={`seat-node ${s.seatType === 'VIP' ? 'vip' : 'normal'} ${s.isOccupied ? 'maintenance-lock' : ''}`}
                                        title={`${t('admin.adminDashboard.theatersTab.rightPanel.seatTitle.code')}: ${s.seatNumber} \n${t('admin.adminDashboard.theatersTab.rightPanel.seatTitle.hint')}`}
                                    >
                                        {s.seatNumber}
                                    </button>
                                ))}
                            </div>
                            <div className="legend-row">
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