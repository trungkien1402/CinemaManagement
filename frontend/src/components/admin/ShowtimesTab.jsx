import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ShowtimesTab = ({ createShowtimeObj, stForm, setStForm, movies, selectedTheaterId, setSelectedTheaterId, theaters, rooms, showtimes }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredShowtimes = showtimes.filter(st => {
        const searchLower = searchTerm.toLowerCase().trim();
        
        const showtimeId = st.showtimeId ? String(st.showtimeId).toLowerCase() : '';
        const movieTitle = st.movie?.title ? st.movie.title.toLowerCase() : '';
        const roomNumber = st.room?.roomNumber ? String(st.room.roomNumber).toLowerCase() : '';
        const showDate = st.showDate ? st.showDate.toLowerCase() : '';

        return showtimeId.includes(searchLower) || 
               movieTitle.includes(searchLower) || 
               roomNumber.includes(searchLower) ||
               showDate.includes(searchLower);
    });

    return (
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.showtimesTab.title')}</h2>
            
            <form onSubmit={createShowtimeObj} className="interactive-form-grid">
                <select value={stForm.movieId} onChange={e => setStForm({...stForm, movieId: e.target.value})} required>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step1')}</option>
                    {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                </select>
                <select value={selectedTheaterId} onChange={e => setSelectedTheaterId(e.target.value)}>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step2')}</option>
                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                </select>
                <select value={stForm.roomId} onChange={e => setStForm({...stForm, roomId: e.target.value})} required>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step3')}</option>
                    {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
                </select>
                <input type="date" value={stForm.showDate} onChange={e => setStForm({...stForm, showDate: e.target.value})} required />
                <input type="time" value={stForm.startTime} onChange={e => setStForm({...stForm, startTime: e.target.value})} required />
                <input type="number" placeholder={t('admin.adminDashboard.showtimesTab.form.placeholders.price')} value={stForm.ticketPrice} onChange={e => setStForm({...stForm, ticketPrice: parseFloat(e.target.value)})} required />

                <button type="submit" className="form-submit-btn-main full-width-field">{t('admin.adminDashboard.showtimesTab.form.buttons.submit')}</button>
            </form>

            <hr className="section-divider" style={{ margin: '25px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

            <div className="search-container-box" style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>{t('admin.adminDashboard.showtimesTab.search.label')}</span>
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.showtimesTab.search.placeholder')} 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e0',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#e2e8f0',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#4a5568'
                        }}
                    >
                        {t('admin.adminDashboard.showtimesTab.search.clearBtn')}
                    </button>
                )}
            </div>

            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.showtimesTab.table.showtimeId')}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.movieTitle')}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.roomNumber')}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.showDate')}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.startTime')}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.ticketPrice')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShowtimes.length > 0 ? (
                            filteredShowtimes.map(st => (
                                <tr key={st.showtimeId}>
                                    <td><strong>{st.showtimeId}</strong></td>
                                    <td>{st.movie?.title}</td>
                                    <td>{st.room?.roomNumber}</td>
                                    <td>{st.showDate}</td>
                                    <td><span className="time-badge">{st.startTime}</span></td>
                                    <td>{st.ticketPrice?.toLocaleString()}đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#718096', fontStyle: 'italic' }}>
                                    {t('admin.adminDashboard.showtimesTab.table.emptyText', { term: searchTerm })}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShowtimesTab;