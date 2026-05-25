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
        // Kiểm tra đăng nhập
        if (!user) {
            alert("Vui lòng đăng nhập để xem lịch sử!");
            navigate('/login');
            return;
        }

        // Biến flag để tránh memory leak khi component unmount
        let isMounted = true;

        // Gọi API lấy lịch sử đặt vé
        axios.get(`http://localhost:8080/api/bookings/history/${user.userId}`)
            .then(res => {
                if (isMounted) {
                    // Đảm bảo dữ liệu trả về là một mảng
                    setHistory(Array.isArray(res.data) ? res.data : []);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Lỗi lấy lịch sử:", err);
                if (isMounted) {
                    setLoading(false);
                }
            });

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [user, navigate]);

    // Định dạng ngày tháng an toàn
    const formatDateTime = (dateString) => {
        if (!dateString) return "Chưa xác định";
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                Đang tải lịch sử đặt vé...
            </div>
        );
    }

    return (
        <div style={{ background: '#0d0d13', color: '#fff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Tiêu đề */}
                <h2 style={{ 
                    borderBottom: '2px solid #ff3333', 
                    paddingBottom: '10px', 
                    marginBottom: '30px',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '24px'
                }}>
                    <img 
                        src={filmIcon} 
                        alt="Film Icon" 
                        style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
                    />
                    LỊCH SỬ ĐẶT VÉ CỦA BẠN
                </h2>

                {/* Nội dung lịch sử */}
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: '80px' }}>
                        <p style={{ fontSize: '18px' }}>Bạn chưa đặt bất kỳ vé xem phim nào!</p>
                        <button 
                            onClick={() => navigate('/')} 
                            style={{ 
                                background: '#ff3333', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '12px 25px', 
                                borderRadius: '5px', 
                                cursor: 'pointer', 
                                marginTop: '15px',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#cc0000'}
                            onMouseOut={(e) => e.target.style.background = '#ff3333'}
                        >
                            Đặt vé ngay
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {history.map((ticket) => (
                            <div 
                                key={ticket.ticketId || ticket.id} 
                                style={{ 
                                    background: '#1a1a24', 
                                    borderRadius: '10px', 
                                    padding: '20px', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', 
                                    borderLeft: '5px solid #28a745' 
                                }}
                            >
                                {/* Bên trái: Thông tin vé */}
                                <div>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#ffcc00', fontSize: '18px', letterSpacing: '0.5px' }}>
                                        Mã Vé: {ticket.ticketId}
                                    </h4>

                                    {/* 1. NGÀY ĐẶT */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <img src={calendarIcon} alt="Calendar" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        <span>Ngày đặt: <strong>{formatDateTime(ticket.bookingDate)}</strong></span>
                                    </p>

                                    {/* 2. SUẤT CHIẾU */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <img src={suatChieu} alt="Showtime" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        {/* Ưu tiên hiển thị giờ chiếu cụ thể nếu backend có trả về thay vì chỉ hiện ID */}
                                        <span>Suất chiếu: <strong>{ticket.showtime?.startTime || `ID: ${ticket.showtime?.showtimeId}`}</strong></span>
                                    </p>

                                    {/* 3. PHIM */}
                                    {ticket.showtime?.movie && (
                                        <p style={{ margin: '8px 0', color: '#ffcc00', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                            <img src={filmIcon} alt="Movie" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                            <span>Phim: <strong style={{ color: '#fff' }}>{ticket.showtime.movie.title}</strong></span>
                                        </p>
                                    )}

                                    {/* 4. GHẾ */}
                                    <p style={{ margin: '8px 0', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <img src={seatIcon} alt="Seat" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                        <span>Ghế số: <span style={{ color: '#fff', fontWeight: 'bold', background: '#333', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{ticket.seat?.seatNumber || ticket.seat?.seatId || 'Chưa rõ'}</span></span>
                                    </p>
                                </div>

                                {/* Bên phải: Trạng thái & Tổng tiền */}
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'col', alignItems: 'flex-end', justifyContent: 'center', gap: '10px' }}>
                                    <span style={{ background: '#28a745', color: '#fff', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
                                        ĐÃ THANH TOÁN
                                    </span>
                                    <h3 style={{ color: '#28a745', margin: '10px 0 0 0', fontSize: '22px', fontWeight: 'bold' }}>
                                        {ticket.totalPrice ? ticket.totalPrice.toLocaleString('vi-VN') : 0} VNĐ
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