import React, { useState } from 'react';

const ShowtimesTab = ({ createShowtimeObj, stForm, setStForm, movies, selectedTheaterId, setSelectedTheaterId, theaters, rooms, showtimes }) => {
    // 1. Tạo state để lưu trữ từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Logic lọc danh sách suất chiếu dựa trên từ khóa nhập vào
    const filteredShowtimes = showtimes.filter(st => {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Tránh lỗi crash nếu dữ liệu từ backend trả về bị trống (null/undefined)
        const showtimeId = st.showtimeId ? String(st.showtimeId).toLowerCase() : '';
        const movieTitle = st.movie?.title ? st.movie.title.toLowerCase() : '';
        const roomNumber = st.room?.roomNumber ? String(st.room.roomNumber).toLowerCase() : '';
        const showDate = st.showDate ? st.showDate.toLowerCase() : '';

        // Trả về true nếu từ khóa khớp với 1 trong các trường dữ liệu
        return showtimeId.includes(searchLower) || 
               movieTitle.includes(searchLower) || 
               roomNumber.includes(searchLower) ||
               showDate.includes(searchLower);
    });

    return (
        <div className="tab-view">
            <h2 className="tab-title">Cấu Hình Lịch Trình Chiếu Phim</h2>
            
            {/* Form tạo suất chiếu giữ nguyên */}
            <form onSubmit={createShowtimeObj} className="interactive-form-grid">
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

                <button type="submit" className="form-submit-btn-main full-width-field"> Phát Hành Lịch Chiếu</button>
            </form>

            <hr className="section-divider" style={{ margin: '25px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

            {/* ========================================================= */}
            {/* THANH TÌM KIẾM MỚI ĐƯỢC THÊM VÀO                           */}
            {/* ========================================================= */}
            <div className="search-container-box" style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Tìm kiếm suất chiếu:</span>
                <input 
                    type="text" 
                    placeholder="Nhập tên phim, mã suất, phòng chiếu hoặc ngày (YYYY-MM-DD)..." 
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
                        Xóa lọc
                    </button>
                )}
            </div>

            {/* BẢNG HIỂN THỊ DỮ LIỆU ĐÃ ĐƯỢC THAY THÀNH LUỒNG ĐÃ QUA LỌC (filteredShowtimes) */}
            <div className="table-responsive-box">
                <table className="data-display-table">
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
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#718096', italic: 'true' }}>
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