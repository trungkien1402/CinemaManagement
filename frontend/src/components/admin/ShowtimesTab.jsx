import React, { useState } from 'react';
import '../style/ShowtimesTab.css';

const ShowtimesTab = ({ createShowtimeObj, stForm, setStForm, movies, selectedTheaterId, setSelectedTheaterId, theaters, rooms, showtimes }) => {
    // State lưu trữ từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // Logic lọc danh sách suất chiếu dựa trên từ khóa nhập vào
    const filteredShowtimes = showtimes.filter(st => {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Tránh lỗi crash nếu dữ liệu bị khuyết thiếu từ backend
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
        <div className="sttab-container">
            <h2 className="sttab-main-title">Cấu Hình Lịch Trình Chiếu Phim</h2>
            
            {/* Form phát hành suất chiếu mới */}
            <form onSubmit={createShowtimeObj} className="sttab-interactive-grid">
                <select value={stForm.movieId} onChange={e => setStForm({...stForm, movieId: e.target.value})} required>
                    <option value="">-- Bước 1: Chọn Phim Chiếu --</option>
                    {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                </select>
                <select value={selectedTheaterId} onChange={e => setSelectedTheaterId(e.target.value)}>
                    <option value="">-- Bước 2: Chọn Cụm Rạp --</option>
                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name}</option>)}
                </select>
                <select value={stForm.roomId} onChange={e => setStForm({...stForm, roomId: e.target.value})} required>
                    <option value="">-- Bước 3: Chọn Phòng Chiếu --</option>
                    {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
                </select>
                <input type="date" value={stForm.showDate} onChange={e => setStForm({...stForm, showDate: e.target.value})} required />
                <input type="time" value={stForm.startTime} onChange={e => setStForm({...stForm, startTime: e.target.value})} required />
                <input type="number" placeholder="Đơn giá vé (VND)" value={stForm.ticketPrice} onChange={e => setStForm({...stForm, ticketPrice: parseFloat(e.target.value)})} required />

                <button type="submit" className="sttab-submit-btn">Phát Hành Lịch Chiếu</button>
            </form>

            <hr className="sttab-divider" />

            {/* Thanh công cụ tìm kiếm lọc dữ liệu */}
            <div className="sttab-search-wrapper">
                <span className="sttab-search-label">Tìm kiếm suất chiếu:</span>
                <div className="sttab-search-input-group">
                    <input 
                        type="text" 
                        placeholder="Nhập tên phim, mã suất, phòng chiếu hoặc ngày (YYYY-MM-DD)..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')} className="sttab-clear-btn">
                            Xóa lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng danh sách kết quả sau lọc */}
            <div className="sttab-table-responsive">
                <table className="sttab-data-table">
                    <thead>
                        <tr>
                            <th>Mã Suất</th>
                            <th>Tên Phim</th>
                            <th>Phòng Chiếu</th>
                            <th>Ngày Chiếu</th>
                            <th>Giờ Bắt Đầu</th>
                            <th>Giá Vé niêm yết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShowtimes.length > 0 ? (
                            filteredShowtimes.map(st => (
                                <tr key={st.showtimeId}>
                                    <td><code className="sttab-id-code">#{st.showtimeId}</code></td>
                                    <td className="sttab-movie-title"><strong>{st.movie?.title}</strong></td>
                                    <td><span className="sttab-room-badge">Phòng {st.room?.roomNumber}</span></td>
                                    <td className="sttab-date-text">{st.showDate}</td>
                                    <td><span className="sttab-time-badge">{st.startTime}</span></td>
                                    <td className="sttab-price-text">{st.ticketPrice?.toLocaleString()}đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="sttab-empty-row">
                                    Không tìm thấy suất chiếu nào khớp với từ khóa "{searchTerm}"
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