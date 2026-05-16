import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/Seat.css';

const SeatSelection = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!showtimeId) return;

        setSelectedSeats([]); // XÓA TRÍ NHỚ GHẾ KHI ĐỔI PHIM
        setLoading(true);

        axios.get(`http://localhost:8080/api/showtimes/${showtimeId}/seats`)
            .then(res => {
                setSeats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải ghế:", err);
                setLoading(false);
            });
    }, [showtimeId]);

    const toggleSeat = (seat) => {
        if (seat.occupied || seat.isOccupied) return;

        const isAlreadySelected = selectedSeats.find(s => s.seatId === seat.seatId);
        if (isAlreadySelected) {
            setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((total, seat) => {
            if (seat.seatType === 'VIP') return total + 50000;
            if (seat.seatType === 'DOI') return total + 100000;
            return total + 30000;
        }, 0);
    };

    const handlePayment = () => {
        if (selectedSeats.length === 0) return alert("Vui lòng chọn ít nhất 1 ghế!");

        const bookingData = {
            userId: 2,
            showtimeId: showtimeId,
            seatIds: selectedSeats.map(s => s.seatId),
            totalPrice: calculateTotal()
        };

        axios.post('http://localhost:8080/api/bookings/create', bookingData)
            .then(() => {
                alert("Đặt vé thành công!");
                navigate('/');
            })
            .catch(err => alert("Lỗi: " + (err.response?.data || "Vui lòng thử lại!")));
    };

    if (loading) return <div className="loading-container">Đang tải sơ đồ phòng chiếu...</div>;

    return (
        <div className="booking-wrapper">
            <div className="screen-container">
                <div className="screen">MÀN HÌNH CHÍNH</div>
            </div>

            <div className="seat-grid">
                {seats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                    const isOccupied = seat.occupied || seat.isOccupied;
                    let seatClass = "seat-box";

                    if (isOccupied) seatClass += " occupied";
                    else if (isSelected) seatClass += " selected";
                    else seatClass += ` ${seat.seatType?.toLowerCase() || 'thuong'}`;

                    return (
                        <div key={seat.seatId} className={seatClass} onClick={() => toggleSeat(seat)}>
                            {seat.seatNumber}
                        </div>
                    );
                })}
            </div>

            <div className="legend-area">
                <div className="legend-item"><span className="box thuong"></span> Thường (30K)</div>
                <div className="legend-item"><span className="box vip"></span> VIP (50K)</div>
                <div className="legend-item"><span className="box doi"></span> Đôi (100K)</div>
                <div className="legend-item"><span className="box selected"></span> Đang chọn</div>
                <div className="legend-item"><span className="box occupied"></span> Đã bán</div>
            </div>

            <div className="info-section">
                <div className="ticket-info">
                    <p>Mã suất chiếu: <strong>{showtimeId}</strong></p>
                    <p>Ghế đã chọn: <strong>{selectedSeats.map(s => s.seatNumber).join(', ') || 'Chưa chọn'}</strong></p>
                </div>
                <div className="total-price-area">
                    <span>Tổng tiền:</span>
                    <h3 className="price">{calculateTotal().toLocaleString()} VNĐ</h3>
                </div>
                <button className="confirm-btn" onClick={handlePayment}>XÁC NHẬN ĐẶT VÉ</button>
            </div>
        </div>
    );
};

export default SeatSelection;