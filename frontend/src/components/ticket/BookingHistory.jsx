import React, { useEffect, useState } from 'react';
import axios from 'axios';
import calendarIcon from '../../assets/calendar.png';
import suatChieu from '../../assets/popcorn.png';
import filmIcon from '../../assets/film.png';
import seatIcon from '../../assets/cinema seat.png';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const BookingHistory = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Nếu chưa đăng nhập thì đá về trang login
        if (!user) {
            alert("Vui lòng đăng nhập để xem lịch sử!");
            navigate('/login');
            return;
        }

        // Gọi API lấy lịch sử đặt vé
        axios.get(`http://localhost:8080/api/bookings/history/${user.userId}`)
            .then(res => {
                setHistory(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi lấy lịch sử:", err);
                setLoading(false);
            });
    }, [user, navigate]);

    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Đang tải lịch sử đặt vé...</div>;
    }

    return (
        <div style={{ background: '#0d0d13', color: '#fff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ 
    borderBottom: '2px solid #ff3333', 
    paddingBottom: '10px', 
    marginBottom: '30px',
    display: 'flex',          /* Ép icon và chữ xếp hàng ngang */
    alignItems: 'center',     /* Căn giữa icon và chữ theo chiều dọc */
    gap: '10px'               /* Khoảng cách giữa icon và chữ */
}}>
    {/* ✅ ĐÃ SỬA: Thay emoji bằng thẻ img chứa filmIcon */}
    <img 
        src={filmIcon} 
        alt="Film Icon" 
        style={{ width: '24px', height: '24px', objectFit: 'contain' }} 
    />
    LỊCH SỬ ĐẶT VÉ CỦA BẠN
</h2>

                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>
                        <p style={{ fontSize: '18px' }}>Bạn chưa đặt bất kỳ vé xem phim nào!</p>
                        <button onClick={() => navigate('/')} style={{ background: '#ff3333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>
                            Đặt vé ngay
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {history.map((ticket) => (
                            <div key={ticket.ticketId} style={{ background: '#1a1a24', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', borderLeft: '5px solid #28a745' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#ffcc00', fontSize: '18px' }}>
                                        Mã Vé: {ticket.ticketId}
                                    </h4>

                                    {/* ✅ 1. NGÀY ĐẶT (Thay 🗓️ bằng calendarIcon) */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={calendarIcon} alt="Calendar" className="figma-label-icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        <span>Ngày đặt: {new Date(ticket.bookingDate).toLocaleString('vi-VN')}</span>
                                    </p>

                                    {/* ✅ 2. SUẤT CHIẾU (Thay 🍿 bằng suatChieu) */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={suatChieu} alt="Showtime" className="figma-label-icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        <span>Suất chiếu ID: <strong>{ticket.showtime?.showtimeId}</strong></span>
                                    </p>

                                    {/* ✅ 3. PHIM (Thay 🎬 bằng filmIcon) */}
                                    {ticket.showtime?.movie && (
                                        <p style={{ margin: '8px 0', color: '#ffcc00', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={filmIcon} alt="Movie" className="figma-label-icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                            <span>Phim: <strong>{ticket.showtime?.movie?.title}</strong></span>
                                        </p>
                                    )}

                                    {/* ✅ 4. GHẾ (Thay 💺 bằng seatIcon) */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={seatIcon} alt="Seat" className="figma-label-icon" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        <span>Ghế số: <span style={{ color: '#fff', fontWeight: 'bold' }}>{ticket.seat?.seatNumber || ticket.seat?.seatId}</span></span>
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ background: '#28a745', color: '#fff', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                                        ĐÃ THANH TOÁN
                                    </span>
                                    <h3 style={{ color: '#28a745', margin: '15px 0 0 0' }}>
                                        {ticket.totalPrice?.toLocaleString()} VNĐ
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;