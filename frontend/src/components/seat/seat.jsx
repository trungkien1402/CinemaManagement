import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/Seat.css';

const SeatSelection = () => {
    // 1. Lấy tham số từ URL (Ví dụ: /dat-ve/ST01/R01)
    const { showtimeId, roomId } = useParams();
    const navigate = useNavigate();

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tạm thời fix giá vé, sau này bạn có thể gọi API lấy giá từ Showtime
    const pricePerSeat = 85000;

    // 2. Tải sơ đồ ghế từ Backend dựa trên roomId lấy từ URL
    useEffect(() => {
        if (!roomId) return;

        setLoading(true);
        axios.get(`http://localhost:8080/api/seats/room/${roomId}`)
            .then(res => {
                setSeats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải ghế:", err);
                setLoading(false);
            });
    }, [roomId]);

    // 3. Logic chọn/bỏ chọn ghế
    const toggleSeat = (seat) => {
        if (seat.isOccupied) return;

        if (selectedSeats.includes(seat.seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seat.seatId));
        } else {
            setSelectedSeats([...selectedSeats, seat.seatId]);
        }
    };

    // 4. Gửi yêu cầu đặt vé về Backend
    const handlePayment = () => {
        if (selectedSeats.length === 0) return alert("Vui lòng chọn ít nhất 1 ghế!");

        const bookingData = {
            userId: 2, // Tạm thời để ID mặc định, sau này lấy từ Auth state
            showtimeId: showtimeId,
            seatIds: selectedSeats,
            pricePerSeat: pricePerSeat
        };

        axios.post('http://localhost:8080/api/bookings/create', bookingData)
            .then(() => {
                alert("Đặt vé thành công! Hệ thống sẽ đưa bạn về trang chủ.");
                navigate('/'); // Đặt xong cho về trang chủ hoặc trang lịch sử
            })
            .catch(err => {
                const errorMsg = err.response?.data || "Không thể đặt vé, vui lòng thử lại!";
                alert("Lỗi: " + errorMsg);
            });
    };

    if (loading) return <div className="loading-container">Đang chuẩn bị sơ đồ phòng chiếu...</div>;

    return (
        <div className="booking-wrapper">
            <div className="screen-container">
                <div className="screen">MÀN HÌNH CHÍNH</div>
            </div>

            {/* Hiển thị lưới ghế */}
            <div className="seat-grid">
                {seats.map(seat => (
                    <div
                        key={seat.seatId}
                        className={`seat-box ${seat.isOccupied ? 'occupied' :
                                   selectedSeats.includes(seat.seatId) ? 'selected' : 'available'}`}
                        onClick={() => toggleSeat(seat)}
                    >
                        {seat.seatNumber}
                    </div>
                ))}
            </div>

            {/* Chú thích màu sắc */}
            <div className="legend-area">
                <div className="legend-item"><span className="box available"></span> Ghế trống</div>
                <div className="legend-item"><span className="box selected"></span> Đang chọn</div>
                <div className="legend-item"><span className="box occupied"></span> Đã bán</div>
            </div>

            {/* Thông tin thanh toán tạm tính */}
            <div className="info-section">
                <div className="ticket-info">
                    <p>Mã suất chiếu: <strong>{showtimeId}</strong></p>
                    <p>Ghế đã chọn: <strong>{selectedSeats.join(', ') || 'Chưa chọn'}</strong></p>
                </div>
                <div className="total-price-area">
                    <span>Tổng tiền thanh toán:</span>
                    <h3 className="price">{(selectedSeats.length * pricePerSeat).toLocaleString()} VNĐ</h3>
                </div>
                <button className="confirm-btn" onClick={handlePayment}>
                    XÁC NHẬN ĐẶT VÉ
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;