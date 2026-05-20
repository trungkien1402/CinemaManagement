import React, { useState, useEffect } from 'react';
// ĐÃ SỬA: Thay thế axios thuần bằng axiosClient để đồng bộ Token và BaseURL
import axiosClient from '../../api/axiosClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Seat.css';

const SeatSelection = () => {

    const { showtimeId } = useParams();
    const navigate = useNavigate();

    // ================= USER =================
    const { user } = useSelector((state) => state.auth);

    // ================= STATE =================
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // ================= LOAD SEATS =================
    useEffect(() => {

        if (!showtimeId) return;

        setSelectedSeats([]);
        setLoading(true);

        // ĐÃ SỬA: Dùng axiosClient và rút gọn đường dẫn
        axiosClient
            .get(`/seats/showtime/${showtimeId}`)
            .then((res) => {
                setSeats(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi tải ghế:", err);
                setLoading(false);
            });

    }, [showtimeId]);

    // ================= CHỌN GHẾ =================
    const toggleSeat = (seat) => {

        if (seat.isBooked) return;

        const exists = selectedSeats.find(
            (s) => s.seatId === seat.seatId
        );

        if (exists) {
            setSelectedSeats(
                selectedSeats.filter(
                    (s) => s.seatId !== seat.seatId
                )
            );
        } else {
            setSelectedSeats([
                ...selectedSeats,
                seat
            ]);
        }
    };

    // ================= TÍNH TIỀN =================
    const calculateTotal = () => {
        return selectedSeats.reduce((total, seat) => {
            if (seat.seatType === 'VIP') {
                return total + 50000;
            }
            if (seat.seatType === 'DOI') {
                return total + 100000;
            }
            return total + 30000;
        }, 0);
    };

    // ================= THANH TOÁN VNPAY =================
    const handlePayment = async () => {

        // CHƯA LOGIN
        if (!user) {
            alert("Vui lòng đăng nhập!");
            navigate('/login');
            return;
        }

        // CHƯA CHỌN GHẾ
        if (selectedSeats.length === 0) {
            alert("Vui lòng chọn ít nhất 1 ghế!");
            return;
        }

        // PHÒNG CHỐNG CLICK ĐÚP 
        if (processing) return;

        try {
            setProcessing(true);

            // Ép kiểu số nguyên thuần túy
            const finalAmount = parseInt(calculateTotal(), 10);

            // DỮ LIỆU BOOKING CHUẨN ĐỒNG BỘ VỚI BACKEND
            const bookingData = {
                userId: user.userId,
                showtimeId: showtimeId,
                seatIds: selectedSeats.map((s) => s.seatId),
                totalPrice: finalAmount
            };

            // LƯU TẠM BOOKING VÀO LOCALSTORAGE
            localStorage.setItem(
                "pendingBooking",
                JSON.stringify(bookingData)
            );

            console.log("=== ĐANG GỬI DATA QUA AXIOS CLIENT ===", bookingData);

            // ĐÃ SỬA: Gọi qua axiosClient để đính kèm Authorization Token ở Header
            const response = await axiosClient.post("/payment/create", bookingData);

            // KIỂM TRA VÀ ĐIỀU HƯỚNG AN TOÀN BẰNG THẺ LINK CHÌM
            if (response.data && response.data.paymentUrl) {
                const paymentUrl = response.data.paymentUrl;
                
                console.log("=== LINK VNPAY HỢP LỆ ===", paymentUrl);
                
                // ĐÃ SỬA: Thay thế window.location.href bằng cơ chế thẻ tạo link ảo 
                // Thêm rel='noopener noreferrer' để Chrome cho phép chuyển giao thức HTTPS -> HTTP localhost mượt mà
                const triggerLink = document.createElement('a');
                triggerLink.href = paymentUrl;
                triggerLink.rel = 'noopener noreferrer';
                
                document.body.appendChild(triggerLink);
                triggerLink.click(); // Kích hoạt lệnh chuyển hướng tự nhiên
                document.body.removeChild(triggerLink);
                
            } else {
                throw new Error("Không nhận được paymentUrl hợp lệ từ Backend!");
            }

        } catch (err) {
            console.error("LỖI XỬ LÝ THANH TOÁN FRONTEND:", err);
            
            localStorage.removeItem("pendingBooking");

            alert(
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                "Khởi tạo giao dịch thanh toán thất bại!"
            );
        } finally {
            setProcessing(false);
        }
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="loading-container">
                Đang tải sơ đồ ghế...
            </div>
        );
    }

    return (
        <div className="booking-wrapper">

            {/* MÀN HÌNH */}
            <div className="screen-container">
                <div className="screen">
                    MÀN HÌNH CHÍNH
                </div>
            </div>

            {/* DANH SÁCH GHẾ */}
            <div className="seat-grid">
                {seats.map((seat) => {
                    const isSelected = selectedSeats.some(
                        (s) => s.seatId === seat.seatId
                    );
                    const isOccupied = seat.isBooked;

                    let seatClass = "seat-box";

                    if (isOccupied) {
                        seatClass += " occupied";
                    } else if (isSelected) {
                        seatClass += " selected";
                    } else {
                        seatClass += ` ${seat.seatType?.toLowerCase() || 'thuong'}`;
                    }

                    return (
                        <div
                            key={seat.seatId}
                            className={seatClass}
                            onClick={() => toggleSeat(seat)}
                        >
                            {seat.seatNumber}
                        </div>
                    );
                })}
            </div>

            {/* CHÚ THÍCH */}
            <div className="legend-area">
                <div className="legend-item">
                    <span className="box thuong"></span>
                    Thường (30K)
                </div>
                <div className="legend-item">
                    <span className="box vip"></span>
                    VIP (50K)
                </div>
                <div className="legend-item">
                    <span className="box doi"></span>
                    Ghế đôi (100K)
                </div>
                <div className="legend-item">
                    <span className="box selected"></span>
                    Đang chọn
                </div>
                <div className="legend-item">
                    <span className="box occupied"></span>
                    Đã bán
                </div>
            </div>

            {/* THÔNG TIN */}
            <div className="info-section">
                <div className="ticket-info">
                    <p>
                        Mã suất chiếu:
                        <strong> {showtimeId}</strong>
                    </p>
                    <p>
                        Ghế đã chọn:
                        <strong>
                            {
                                selectedSeats.length > 0
                                    ? " " + selectedSeats.map((s) => s.seatNumber).join(', ')
                                    : " Chưa chọn"
                            }
                        </strong>
                    </p>
                    <p>
                        Số lượng ghế:
                        <strong> {selectedSeats.length}</strong>
                    </p>
                </div>

                {/* TỔNG TIỀN */}
                <div className="total-price-area">
                    <span>Tổng tiền:</span>
                    <h3 className="price">
                        {calculateTotal().toLocaleString()} VNĐ
                    </h3>
                </div>

                {/* BUTTON THANH TOÁN */}
                <button
                    className="confirm-btn"
                    onClick={handlePayment}
                    disabled={processing}
                >
                    {
                        processing
                            ? "ĐANG CHUYỂN THANH TOÁN..."
                            : "THANH TOÁN VNPAY"
                    }
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;