import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
                <h2 style={{ borderBottom: '2px solid #ff3333', paddingBottom: '10px', marginBottom: '30px' }}>
                    🎬 LỊCH SỬ ĐẶT VÉ CỦA BẠN
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
                                    <h4 style={{ margin: '0 0 10px 0', color: '#ffcc00', fontSize: '18px' }}>
                                        Mã Vé: {ticket.ticketId}
                                    </h4>
                                    <p style={{ margin: '5px 0', color: '#ccc' }}>
                                        🗓️ Ngày đặt: {new Date(ticket.bookingDate).toLocaleString('vi-VN')}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#ccc' }}>
                                        🍿 Suất chiếu ID: <strong>{ticket.showtime?.showtimeId}</strong>
                                    </p>
                                    {ticket.showtime?.movie && (
                                        <p style={{ margin: '5px 0', color: '#ffcc00' }}>
                                            🎬 Phim: <strong>{ticket.showtime?.movie?.title}</strong> {/* Thay movieName thành title */}
                                        </p>
                                    )}
                                    <p style={{ margin: '5px 0', color: '#ccc' }}>
                                        💺 Ghế số: <span style={{ color: '#fff', fontWeight: 'bold' }}>{ticket.seat?.seatNumber || ticket.seat?.seatId}</span>
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