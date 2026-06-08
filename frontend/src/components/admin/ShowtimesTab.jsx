import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/ShowtimesTab.css';

const ShowtimesTab = ({ createShowtimeObj, stForm, setStForm, movies, selectedTheaterId, setSelectedTheaterId, theaters, rooms, showtimes }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    // Logic lọc danh sách suất chiếu dựa trên từ khóa nhập vào (Có chống crash dữ liệu)
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

    // Lọc danh sách phim chỉ lấy các phim đang chiếu (status = 1)
    const nowShowingMovies = movies ? movies.filter(m => m.status === 1) : [];

    return (
        <div className="sttab-container tab-view">
            <h2 className="sttab-main-title tab-title">
                {t('admin.adminDashboard.showtimesTab.title') || "Cấu Hình Lịch Trình Chiếu Phim"}
            </h2>
            
            {/* Form phát hành suất chiếu mới */}
            <form onSubmit={createShowtimeObj} className="sttab-interactive-grid interactive-form-grid">
                <select value={stForm.movieId} onChange={e => setStForm({...stForm, movieId: e.target.value})} required>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step1') || "Bước 1: Chọn phim"}</option>
                    {nowShowingMovies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                </select>
                <select value={selectedTheaterId} onChange={e => setSelectedTheaterId(e.target.value)}>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step2') || "Bước 2: Chọn rạp cụm"}</option>
                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                </select>
                <select value={stForm.roomId} onChange={e => setStForm({...stForm, roomId: e.target.value})} required>
                    <option value="">{t('admin.adminDashboard.showtimesTab.form.steps.step3') || "Bước 3: Chọn phòng chiếu"}</option>
                    {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
                </select>
                <input type="date" value={stForm.showDate} onChange={e => setStForm({...stForm, showDate: e.target.value})} required />
                <input type="time" value={stForm.startTime} onChange={e => setStForm({...stForm, startTime: e.target.value})} required />
                <input type="number" placeholder={t('admin.adminDashboard.showtimesTab.form.placeholders.price') || "Giá vé (VNĐ)"} value={stForm.ticketPrice} onChange={e => setStForm({...stForm, ticketPrice: parseFloat(e.target.value)})} required />

                <button type="submit" className="sttab-submit-btn form-submit-btn-main full-width-field">
                    {t('admin.adminDashboard.showtimesTab.form.buttons.submit') || "Phát Hành Lịch Chiếu"}
                </button>
            </form>

            <hr className="sttab-divider" />

            {/* Thanh công cụ tìm kiếm lọc dữ liệu */}
            <div className="sttab-search-wrapper search-container-box" style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="sttab-search-label" style={{ fontWeight: 'bold', color: '#4a5568' }}>
                    {t('admin.adminDashboard.showtimesTab.search.label') || "Tìm kiếm suất chiếu:"}
                </span>
                <div className="sttab-search-input-group" style={{ flex: 1, display: 'flex', gap: '5px' }}>
                    <input 
                        type="text" 
                        placeholder={t('admin.adminDashboard.showtimesTab.search.placeholder') || "Nhập tên phim, mã suất, phòng chiếu..."} 
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
                            type="button" 
                            onClick={() => setSearchTerm('')} 
                            className="sttab-clear-btn"
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#e2e8f0',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#4a5568'
                            }}
                        >
                            {t('admin.adminDashboard.showtimesTab.search.clearBtn') || "Xóa lọc"}
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng danh sách kết quả sau lọc */}
            <div className="sttab-table-responsive table-responsive-box">
                <table className="sttab-data-table data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.showtimesTab.table.showtimeId') || "Mã Suất"}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.movieTitle') || "Tên Phim"}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.roomNumber') || "Phòng Chiếu"}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.showDate') || "Ngày Chiếu"}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.startTime') || "Giờ Bắt Đầu"}</th>
                            <th>{t('admin.adminDashboard.showtimesTab.table.ticketPrice') || "Giá Vé"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShowtimes.length > 0 ? (
                            filteredShowtimes.map(st => (
                                <tr key={st.showtimeId}>
                                    <td><code className="sttab-id-code">#{st.showtimeId}</code></td>
                                    <td className="sttab-movie-title"><strong>{st.movie?.title}</strong></td>
                                    <td><span className="sttab-room-badge">{st.room?.roomNumber}</span></td>
                                    <td className="sttab-date-text">{st.showDate}</td>
                                    <td><span className="sttab-time-badge">{st.startTime}</span></td>
                                    <td className="sttab-price-text">{st.ticketPrice?.toLocaleString()}đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="sttab-empty-row" style={{ textAlign: 'center', padding: '20px', color: '#718096', fontStyle: 'italic' }}>
                                    {t('admin.adminDashboard.showtimesTab.table.emptyText', { term: searchTerm }) || `Không tìm thấy suất chiếu nào khớp với từ khóa "${searchTerm}"`}
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