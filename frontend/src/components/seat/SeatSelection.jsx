import React, { useState, useEffect } from 'react';
// ĐÃ SỬA: Thay thế axios thuần bằng axiosClient để đồng bộ Token và BaseURL
import axiosClient from '../../api/axiosClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Seat.css';
// IMPORT HOOK THANH TOÁN MỚI TÁCH
import { useVNPayPayment } from '../../hook/useVNPayPayment'; 
import { useTranslation } from 'react-i18next';

const SeatSelection = () => {
    const { t } = useTranslation();
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    // ================= USER =================
    const { user } = useSelector((state) => state.auth);

    // ================= STATE =================
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sử dụng Hook thanh toán đã tách biệt
    const { handleVNPayPayment, processing } = useVNPayPayment();

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
                setLoading(false); // Fix lỗi gõ sai chữ Loading(false) gốc
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

    // ================= KÍCH HOẠT THANH TOÁN =================
    const handlePayment = () => {
        // Gọi hàm từ hook và truyền toàn bộ dữ liệu hiện tại vào
        handleVNPayPayment({
            user,
            showtimeId,
            selectedSeats,
            totalAmount: calculateTotal(),
            navigate
        });
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="loading-container">
                {t('auth.seat.status.loading') || "Đang tải sơ đồ ghế..."}
            </div>
        );
    }

    return (
        <div className="booking-wrapper">

            {/* MÀN HÌNH */}
            <div className="screen-container">
                <div className="screen">
                    {t('auth.seat.screen') || "MÀN HÌNH CHÍNH"}
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
                    {t('auth.seat.legend.standard') || "Thường (30K)"}
                </div>
                <div className="legend-item">
                    <span className="box vip"></span>
                    {t('auth.seat.legend.vip') || "VIP (50K)"}
                </div>
                <div className="legend-item">
                    <span className="box doi"></span>
                    {t('auth.seat.legend.double') || "Ghế đôi (100K)"}
                </div>
                <div className="legend-item">
                    <span className="box selected"></span>
                    {t('auth.seat.legend.selecting') || "Đang chọn"}
                </div>
                <div className="legend-item">
                    <span className="box occupied"></span>
                    {t('auth.seat.legend.sold') || "Đã bán"}
                </div>
            </div>

            {/* THÔNG TIN */}
            <div className="info-section">
                <div className="ticket-info">
                    <p>
                        {t('auth.seat.info.showtimeId') || "Mã suất chiếu:"}
                        <strong> {showtimeId}</strong>
                    </p>
                    <p>
                        {t('auth.seat.info.selectedSeats') || "Ghế đã chọn:"}
                        <strong>
                            {
                                selectedSeats.length > 0
                                    ? " " + selectedSeats.map((s) => s.seatNumber).join(', ')
                                    : " " + (t('auth.seat.info.none') || "Chưa chọn")
                            }
                        </strong>
                    </p>
                    <p>
                        {t('auth.seat.info.seatCount') || "Số lượng ghế:"}
                        <strong> {selectedSeats.length}</strong>
                    </p>
                </div>

                {/* TỔNG TIỀN */}
                <div className="total-price-area">
                    <span>{t('auth.seat.info.totalAmount') || "Tổng tiền:"}</span>
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
                            ? (t('auth.seat.buttons.processing') || "ĐANG CHUYỂN THANH TOÁN...")
                            : (t('auth.seat.buttons.pay') || "THANH TOÁN VNPAY")
                    }
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;