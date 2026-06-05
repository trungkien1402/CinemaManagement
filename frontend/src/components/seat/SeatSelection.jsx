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

    // Giá vé gốc động lấy từ database suất chiếu, mặc định phòng hờ là 85000 VNĐ
    const [baseTicketPrice, setBaseTicketPrice] = useState(85000); 

    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null); 
    const [voucherError, setVoucherError] = useState("");
    const [voucherSuccess, setVoucherSuccess] = useState("");

    const [availablePoints, setAvailablePoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);

    const { handleVNPayPayment, processing } = useVNPayPayment();

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user')) || {};
        const fetchUserId = user?.id || user?.userId || localUser?.id || localUser?.userId;

        if (fetchUserId) {
            axiosClient.get(`/users/${fetchUserId}`)
                .then(res => {
                    setAvailablePoints(res.data.points || 0);
                })
                .catch(err => console.error("Lỗi lấy điểm mới nhất:", err));
        }
    }, [user]);

    useEffect(() => {
        if (!showtimeId) return;

        setSelectedSeats([]);
        setLoading(true);
        setVoucherCode("");
        setAppliedVoucher(null);
        setVoucherError("");
        setVoucherSuccess("");
        setPointsToUse(0);

        const fetchData = async () => {
            try {
                // 1. GỌI API LẤY CHI TIẾT SUẤT CHIẾU ĐỂ LẤY GIÁ VÉ GỐC
                try {
                    const showtimeRes = await axiosClient.get(`/showtimes/${showtimeId}`);
                    if (showtimeRes.data && showtimeRes.data.ticketPrice) {
                        setBaseTicketPrice(Number(showtimeRes.data.ticketPrice));
                        console.log("==> Đã lấy được giá vé từ Suất chiếu:", showtimeRes.data.ticketPrice);
                    } else if (showtimeRes.data && showtimeRes.data.ticket_price) {
                        setBaseTicketPrice(Number(showtimeRes.data.ticket_price));
                    }
                } catch (stError) {
                    console.warn("Sử dụng giá mặc định dự phòng 85000đ:", stError);
                    setBaseTicketPrice(85000);
                }

                // 2. GỌI API LẤY DANH SÁCH GHẾ BAN ĐẦU 
                const seatsRes = await axiosClient.get(`/seats/showtime/${showtimeId}`);
                setSeats(seatsRes.data);
                
                if (seatsRes.data && seatsRes.data.length > 0) {
                    const colNumbers = seatsRes.data.map(s => {
                        const match = s.seatNumber.match(/\d+/);
                        return match ? parseInt(match[0], 10) : 0;
                    });
                    const calculatedCols = Math.max(...colNumbers, 10);
                    setMaxCols(calculatedCols);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu chọn ghế:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            
            if (type === 'VIP') {
                return total + (baseTicketPrice * 1.2); // Ghế VIP = +20%
            }
            if (type === 'DOUBLE' || type === 'DOI') {
                return total + (baseTicketPrice * 2); // Ghế đôi = x2 (+100%)
            }
            return total + baseTicketPrice; // Ghế thường = 100%
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
        const afterVoucher = calculateSubTotal() - calculateDiscount();
        const finalPrice = afterVoucher - (pointsToUse * 100);
        return finalPrice > 0 ? finalPrice : 0;
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
            setPointsToUse(0);
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
        setPointsToUse(0);
    };

    const handlePayment = async () => {
        if (selectedSeats.length === 0) return;

        const pendingBooking = {
            showtimeId: showtimeId,
            userId: user?.id || null,
            selectedSeats: selectedSeats,
            totalAmount: calculateTotal(),
            voucherCode: appliedVoucher ? appliedVoucher.voucherCode : null,
            pointsToUse: pointsToUse
        };

        try {
            await axiosClient.post('/seats/hold', {
                showtimeId: showtimeId,
                seatIds: selectedSeats.map(s => s.seatId),
                userId: user?.id || null
            });

            localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

            handleVNPayPayment({
                user,
                showtimeId,
                selectedSeats,
                totalAmount: calculateTotal(),
                voucherCode: appliedVoucher ? appliedVoucher.voucherCode : null,
                navigate
            });

        } catch (err) {
            console.error("Lỗi giữ ghế hệ thống:", err);
            if (err.response && err.response.data) {
                alert(`⚠️ ${err.response.data}`);
            } else {
                alert("⚠️ Ghế bạn chọn hiện tại đang có người giữ hoặc đã được bán. Vui lòng thử lại!");
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('auth.seat.status.loading') || "Đang tải sơ đồ ghế..."}</p>
            </div>
        );
    }

    return (
        <div className="booking-wrapper">
            <button 
                onClick={() => navigate(-1)} 
                className="close-seat-selection-btn"
                title="Hủy chọn ghế và quay lại"
            >
                ✕
            </button>

            <div className="screen-container">
                <div className="screen">{t('auth.seat.screen') || "MÀN HÌNH CHÍNH"}</div>
                <div className="screen-glow"></div>
            </div>

            <div 
                className="seat-grid" 
                style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(40px, 60px))` }}
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
                <div className="legend-item">
                    <span className="box normal"></span>
                    <span className="legend-label">Thường ({baseTicketPrice.toLocaleString()}đ)</span>
                </div>
                <div className="legend-item">
                    <span className="box vip"></span>
                    <span className="legend-label">VIP ({(baseTicketPrice * 1.2).toLocaleString()}đ)</span>
                </div>
                <div className="legend-item">
                    <span className="box doi"></span>
                    <span className="legend-label">Ghế đôi ({(baseTicketPrice * 2).toLocaleString()}đ)</span>
                </div>
                <div className="legend-item">
                    <span className="box selected"></span>
                    <span className="legend-label">Đang chọn</span>
                </div>
                <div className="legend-item">
                    <span className="box occupied"></span>
                    <span className="legend-label">Đã bán</span>
                </div>
            </div>

            <div className="voucher-section">
                <h4 className="voucher-title">
                    {t('auth.seat.voucher.title') || "Khuyến mãi / Mã giảm giá"}
                </h4>
                <div className="voucher-form-group">
                    <input 
                        type="text" 
                        placeholder={t('auth.seat.voucher.placeholder') || "Nhập mã voucher..."} 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        disabled={!!appliedVoucher}
                        className="voucher-input"
                    />
                    {!appliedVoucher ? (
                        <button onClick={handleApplyVoucher} className="voucher-btn apply">
                            {t('auth.seat.voucher.buttons.apply') || "Áp dụng"}
                        </button>
                    ) : (
                        <button onClick={handleRemoveVoucher} className="voucher-btn remove">
                            {t('auth.seat.voucher.buttons.remove') || "Hủy bỏ"}
                        </button>
                    )}
                </div>
                {voucherError && <p className="voucher-msg error">⚠️ {voucherError}</p>}
                {voucherSuccess && <p className="voucher-msg success">✅ {voucherSuccess}</p>}
            </div>

            {availablePoints >= 0 && (
                <div className="points-section" style={{ margin: "0 auto 20px auto", maxWidth: "600px", background: "#1f293d", padding: "15px", borderRadius: "8px" }}>
                    <h4 style={{ color: "#ffc107", marginBottom: "5px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-star"></i> Đổi Điểm Thưởng
                    </h4>
                    <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "12px" }}>
                        Bạn đang có: <strong style={{color: "#fff"}}>{availablePoints.toLocaleString()}</strong> điểm (10 điểm = 1.000 VNĐ)
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="number"
                            min="0"
                            max={availablePoints}
                            placeholder={selectedSeats.length === 0 ? "Vui lòng chọn ghế trước..." : "Nhập số điểm..."}
                            value={pointsToUse === 0 ? '' : pointsToUse}
                            onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                const maxAllowed = Math.min(availablePoints, Math.floor((calculateSubTotal() - calculateDiscount()) / 100));
                                if (val > maxAllowed) val = maxAllowed;
                                setPointsToUse(val);
                            }}
                            disabled={selectedSeats.length === 0}
                            style={{
                                flex: 1, padding: "10px", borderRadius: "4px",
                                border: "1px solid #4b5563", background: "#0f172a",
                                color: "#fff", cursor: selectedSeats.length === 0 ? "not-allowed" : "text"
                            }}
                        />
                        <span style={{ color: "#fff", fontWeight: "bold" }}>điểm</span>
                    </div>
                    {pointsToUse > 0 && (
                        <p style={{ color: "#4ade80", marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
                            ✅ Được giảm: -{(pointsToUse * 100).toLocaleString()} VNĐ
                        </p>
                    )}
                </div>
            )}

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
                    {(appliedVoucher || pointsToUse > 0) && selectedSeats.length > 0 && (
                        <div style={{ fontSize: "14px", color: "#9ca3af", textAlign: "right", marginBottom: "8px" }}>
                            <p style={{ margin: "4px 0" }}>{t('auth.seat.info.subTotal') || "Tạm tính:"} {calculateSubTotal().toLocaleString()} VNĐ</p>
                            {appliedVoucher && <p style={{ margin: "4px 0", color: "#60a5fa" }}>Voucher: -{calculateDiscount().toLocaleString()} VNĐ</p>}
                            {pointsToUse > 0 && <p style={{ margin: "4px 0", color: "#4ade80" }}>Dùng điểm: -{(pointsToUse * 100).toLocaleString()} VNĐ</p>}
                        </div>
                    )}
                    <span className="total-label">{t('auth.seat.info.totalAmount') || "Tổng tiền thanh toán:"}</span>
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