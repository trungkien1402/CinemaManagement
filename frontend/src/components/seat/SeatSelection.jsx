import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../style/Seat.css';
import { useVNPayPayment } from '../../hook/useVNPayPayment'; 
import { useTranslation } from 'react-i18next';

const SeatSelection = () => {
    const { t } = useTranslation();
    const { showtimeId } = useParams();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxCols, setMaxCols] = useState(10); 

    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null); 
    const [voucherError, setVoucherError] = useState("");
    const [voucherSuccess, setVoucherSuccess] = useState("");

    const { handleVNPayPayment, processing } = useVNPayPayment();

    useEffect(() => {
        if (!showtimeId) return;

        setSelectedSeats([]);
        setLoading(true);

        setVoucherCode("");
        setAppliedVoucher(null);
        setVoucherError("");
        setVoucherSuccess("");

        axiosClient
            .get(`/seats/showtime/${showtimeId}`)
            .then((res) => {
                setSeats(res.data);
                if (res.data && res.data.length > 0) {
                    const colNumbers = res.data.map(s => {
                        const match = s.seatNumber.match(/\d+/);
                        return match ? parseInt(match[0], 10) : 0;
                    });
                    const calculatedCols = Math.max(...colNumbers, 10);
                    setMaxCols(calculatedCols);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi tải ghế:", err);
                setLoading(false); 
            });
    }, [showtimeId]);

    const toggleSeat = (seat) => {
        if (seat.isBooked) return;

        const exists = selectedSeats.find((s) => s.seatId === seat.seatId);
        if (exists) {
            setSelectedSeats(selectedSeats.filter((s) => s.seatId !== seat.seatId));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const calculateSubTotal = () => {
        return selectedSeats.reduce((total, seat) => {
            const type = seat.seatType ? seat.seatType.toUpperCase() : 'NORMAL';
            if (type === 'VIP') return total + 50000;
            if (type === 'DOUBLE' || type === 'DOI') return total + 100000;
            return total + 30000;
        }, 0);
    };

    const calculateDiscount = () => {
        if (!appliedVoucher || selectedSeats.length === 0) return 0;
        const subTotal = calculateSubTotal();
        let discount = 0;

        if (appliedVoucher.discountType === 'PERCENT') {
            discount = (subTotal * appliedVoucher.discountValue) / 100;
        } else {
            discount = appliedVoucher.discountValue;
        }
        return discount > subTotal ? subTotal : discount;
    };

    const calculateTotal = () => {
        return calculateSubTotal() - calculateDiscount();
    };

    const handleApplyVoucher = async () => {
        setVoucherError("");
        setVoucherSuccess("");
        
        if (!voucherCode.trim()) {
            setVoucherError(t('auth.seat.voucher.errors.empty') || "Vui lòng điền mã giảm giá!");
            return;
        }

        try {
            const response = await axiosClient.get(`/vouchers/check?code=${voucherCode.trim()}`);
            setAppliedVoucher(response.data);
            const successMsg = t('auth.seat.voucher.success') || "Áp dụng thành công! Mã giảm:";
            setVoucherSuccess(`${successMsg} ${response.data.discountType === 'PERCENT' ? response.data.discountValue + '%' : response.data.discountValue.toLocaleString() + 'đ'}`);
        } catch (error) {
            setAppliedVoucher(null);
            if (error.response && error.response.data) {
                setVoucherError(error.response.data); 
            } else {
                setVoucherError(t('auth.seat.voucher.errors.invalid') || "Mã giảm giá không chính xác hoặc đã hết hạn!");
            }
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
        setVoucherSuccess("");
        setVoucherError("");
    };

    // 🛠️ HÀM THANH TOÁN ĐÃ ĐƯỢC CẬP NHẬT ĐỂ ĐỒNG BỘ ROLLBACK
    const handlePayment = async () => {
        if (selectedSeats.length === 0) return;

        // Đóng gói thông tin đặt vé tạm thời để lưu lại dự phòng
        const pendingBooking = {
            showtimeId: showtimeId,
            userId: user?.id || null,
            selectedSeats: selectedSeats, // Giữ danh sách ghế để đối chiếu nhả ghế khi hủy
            totalAmount: calculateTotal(),
            voucherCode: appliedVoucher ? appliedVoucher.voucherCode : null
        };

        // Lưu vào localStorage trước khi chuyển hướng bay sang cổng VNPay
        localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

        handleVNPayPayment({
            user,
            showtimeId,
            selectedSeats,
            totalAmount: calculateTotal(), 
            voucherCode: appliedVoucher ? appliedVoucher.voucherCode : null, 
            navigate
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                {t('auth.seat.status.loading') || "Đang tải sơ đồ ghế..."}
            </div>
        );
    }

    return (
        <div className="booking-wrapper">
            <div className="screen-container">
                <div className="screen">{t('auth.seat.screen') || "MÀN HÌNH CHÍNH"}</div>
                <div className="screen-glow"></div>
            </div>

            <div 
                className="seat-grid" 
                style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(45px, 65px))` }}
            >
                {seats.map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                    const isOccupied = seat.isBooked;
                    const currentType = seat.seatType ? seat.seatType.toUpperCase() : 'NORMAL';

                    let seatClass = "seat-box";
                    if (isOccupied) {
                        seatClass += " occupied";
                    } else if (isSelected) {
                        seatClass += " selected";
                    } else {
                        if (currentType === 'DOUBLE' || currentType === 'DOI') {
                            seatClass += " double";
                        } else if (currentType === 'VIP') {
                            seatClass += " vip";
                        } else {
                            seatClass += " normal";
                        }
                    }

                    return (
                        <div
                            key={seat.seatId}
                            className={seatClass}
                            onClick={() => toggleSeat(seat)}
                        >
                            {isOccupied ? <span className="cancel-x">✕</span> : seat.seatNumber}
                        </div>
                    );
                })}
            </div>

            <div className="legend-area">
                <div className="legend-item"><span className="box normal"></span>{t('auth.seat.legend.standard') || "Thường (30K)"}</div>
                <div className="legend-item"><span className="box vip"></span>{t('auth.seat.legend.vip') || "VIP (50K)"}</div>
                <div className="legend-item"><span className="box doi"></span>{t('auth.seat.legend.double') || "Ghế đôi (100K)"}</div>
                <div className="legend-item"><span className="box selected"></span>{t('auth.seat.legend.selecting') || "Đang chọn"}</div>
                <div className="legend-item"><span className="box occupied"></span>{t('auth.seat.legend.sold') || "Đã bán"}</div>
            </div>

            <div className="voucher-section" style={{ margin: "20px auto", maxWidth: "600px", background: "#1f293d", padding: "15px", borderRadius: "8px" }}>
                <h4 style={{ color: "#fff", marginBottom: "10px", fontSize: "16px" }}>
                    {t('auth.seat.voucher.title') || "Khuyến mãi / Mã giảm giá"}
                </h4>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                        type="text" 
                        placeholder={t('auth.seat.voucher.placeholder') || "Nhập mã voucher..."} 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        disabled={!!appliedVoucher}
                        style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #4b5563", background: "#0f172a", color: "#fff" }}
                    />
                    {!appliedVoucher ? (
                        <button onClick={handleApplyVoucher} style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                            {t('auth.seat.voucher.buttons.apply') || "Áp dụng"}
                        </button>
                    ) : (
                        <button onClick={handleRemoveVoucher} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                            {t('auth.seat.voucher.buttons.remove') || "Hủy bỏ"}
                        </button>
                    )}
                </div>
                {voucherError && <p style={{ color: "#ef4444", marginTop: "8px", fontSize: "14px" }}>⚠️ {voucherError}</p>}
                {voucherSuccess && <p style={{ color: "#10b981", marginTop: "8px", fontSize: "14px" }}>✅ {voucherSuccess}</p>}
            </div>

            <div className="info-section">
                <div className="ticket-info">
                    <p>{t('auth.seat.info.showtimeId') || "Mã suất chiếu:"}<strong> {showtimeId}</strong></p>
                    <p>{t('auth.seat.info.selectedSeats') || "Ghế đã chọn:"}
                        <strong className="highlight-text">
                            {selectedSeats.length > 0 ? " " + selectedSeats.map((s) => s.seatNumber).join(', ') : " " + (t('auth.seat.info.none') || "Chưa chọn")}
                        </strong>
                    </p>
                    <p>{t('auth.seat.info.seatCount') || "Số lượng ghế:"}<strong> {selectedSeats.length}</strong></p>
                </div>

                <div className="total-price-area">
                    {appliedVoucher && (
                        <div style={{ fontSize: "14px", color: "#9ca3af", textAlign: "right", marginBottom: "5px" }}>
                            <p>{t('auth.seat.info.subTotal') || "Tạm tính:"} {calculateSubTotal().toLocaleString()} VNĐ</p>
                            <p>{t('auth.seat.info.discount') || "Giảm giá:"} -{calculateDiscount().toLocaleString()} VNĐ</p>
                        </div>
                    )}
                    <span>{t('auth.seat.info.totalAmount') || "Tổng tiền thanh toán:"}</span>
                    <h3 className="price">{calculateTotal().toLocaleString()} VNĐ</h3>
                </div>

                <button 
                    className="confirm-btn" 
                    onClick={handlePayment} 
                    disabled={processing || selectedSeats.length === 0}
                >
                    {processing ? (t('auth.seat.buttons.processing') || "ĐANG CHUYỂN THANH TOÁN...") : (t('auth.seat.buttons.pay') || "THANH TOÁN VNPAY")}
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;