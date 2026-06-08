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

    const [availablePoints, setAvailablePoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);

    // state lưu giá niêm yết từ admin
    const [basePrice, setBasePrice] = useState(30000);

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

        // api lấy thông tin suất chiếu bóc tách giá niêm yết
        axiosClient.get(`/showtimes/${showtimeId}`)
            .then((res) => {
                if (res.data) {
                    const fetchedPrice = res.data.ticketPrice || res.data.price || res.data.ticket_price || 30000;
                    setBasePrice(fetchedPrice);
                }
            })
            .catch((err) => console.error("Lỗi lấy giá suất chiếu:", err));

        // API LẤY GHẾ
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

    // tính toán số tiền dựa trên baseprice
    const calculateSubTotal = () => {
        return selectedSeats.reduce((total, seat) => {
            const type = seat.seatType ? seat.seatType.toUpperCase() : 'NORMAL';
            if (type === 'VIP') return total + (basePrice + 20000);
            if (type === 'DOUBLE' || type === 'DOI') return total + (basePrice * 2);
            return total + basePrice;
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
                {t('auth.seat.status.loading') || "Đang tải sơ đồ ghế..."}
            </div>
        );
    }

    // Nhóm ghế theo dòng (ký tự đầu của seatNumber, ví dụ: 'A', 'B'...)
    const seatsByRow = seats.reduce((groups, seat) => {
        const row = seat.seatNumber ? seat.seatNumber.charAt(0) : 'A';
        if (!groups[row]) {
            groups[row] = [];
        }
        groups[row].push(seat);
        return groups;
    }, {});

    // Tính số lượng cột tối đa trong một dòng dựa trên số lượng ghế của hàng đó
    const calculatedMaxCols = Math.max(
        ...Object.values(seatsByRow).map(seatsInRow => seatsInRow.length),
        10
    );

    return (
        <div className="booking-wrapper">
            <div className="screen-container">
                <div className="screen">{t('auth.seat.screen') || "MÀN HÌNH CHÍNH"}</div>
                <div className="screen-glow"></div>
            </div>

            <div className="seat-layout-container" style={{ '--max-cols': calculatedMaxCols }}>
                {Object.keys(seatsByRow).sort().map((rowLetter) => {
                    let currentCol = 1; // Khởi tạo cột chạy từ 1 cho mỗi hàng ghế
                    return (
                        <div className="seat-row" key={rowLetter}>
                            <div className="row-label">{rowLetter}</div>
                            <div className="row-seats">
                                {seatsByRow[rowLetter].map((seat) => {
                                    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                                    const isOccupied = seat.isBooked;
                                    const currentType = seat.seatType ? seat.seatType.toUpperCase() : 'NORMAL';

                                     let seatClass = "seat-box";
                                     
                                     // Áp dụng loại ghế trước để giữ nguyên cấu trúc (Thường, VIP, Đôi)
                                     if (currentType === 'DOUBLE' || currentType === 'DOI') {
                                         seatClass += " double";
                                     } else if (currentType === 'VIP') {
                                         seatClass += " vip";
                                     } else {
                                         seatClass += " normal";
                                     }

                                     // Áp dụng trạng thái đè lên
                                     if (isOccupied) {
                                         seatClass += " occupied";
                                     } else if (isSelected) {
                                         seatClass += " selected";
                                     }

                                     // Đặt vị trí cột dồn toa đều đặn 1 ô mỗi ghế
                                     const seatStyle = {
                                         gridRow: 1,
                                         gridColumn: `${currentCol} / span 1`
                                     };

                                     // Tăng biến đếm cột cho ghế tiếp theo
                                     currentCol += 1;

                                    return (
                                        <div
                                            key={seat.seatId}
                                            className={seatClass}
                                            style={seatStyle}
                                            onClick={() => toggleSeat(seat)}
                                        >
                                            {isOccupied ? <span className="cancel-x">✕</span> : seat.seatNumber}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* chú thích legend hiển thị động theo baseprice từ admin */}
            <div className="legend-area">
                <div className="legend-item"><span className="box normal"></span>{t('auth.seat.legend.standard') || `Thường (${basePrice.toLocaleString()}đ)`}</div>
                <div className="legend-item"><span className="box vip"></span>{t('auth.seat.legend.vip') || `VIP (${(basePrice + 20000).toLocaleString()}đ)`}</div>
                <div className="legend-item"><span className="box doi"></span>{t('auth.seat.legend.double') || `Ghế đôi (${(basePrice * 2).toLocaleString()}đ)`}</div>
                <div className="legend-item"><span className="box selected"></span>{t('auth.seat.legend.selecting') || "Đang chọn"}</div>
                <div className="legend-item"><span className="box occupied"></span>{t('auth.seat.legend.sold') || "Đã bán"}</div>
            </div>

            <div className="voucher-section" style={{ margin: "20px auto 10px auto", maxWidth: "600px", background: "#1f293d", padding: "15px", borderRadius: "8px" }}>
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

            {availablePoints >= 0 && (
                <div className="points-section" style={{ margin: "0 auto 20px auto", maxWidth: "600px", background: "#1f293d", padding: "15px", borderRadius: "8px" }}>
                    <h4 style={{ color: "#ffc107", marginBottom: "5px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-star"></i> {t('auth.seat.points.title') || "Đổi Điểm Thưởng"}
                    </h4>
                    <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "12px" }}>
                        {t('auth.seat.points.balance', { points: availablePoints.toLocaleString() }) || `Bạn đang có: ${availablePoints.toLocaleString()} điểm (10 điểm = 1.000 VNĐ)`}
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            type="number"
                            min="0"
                            max={availablePoints}
                            placeholder={selectedSeats.length === 0 ? (t('auth.seat.points.placeholderSelectSeat') || "Vui lòng chọn ghế trước...") : (t('auth.seat.points.placeholderEnterPoints') || "Nhập số điểm...")}
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
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{t('auth.seat.points.unit') || "điểm"}</span>
                    </div>
                    {pointsToUse > 0 && (
                        <p style={{ color: "#4ade80", marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
                            ✅ {t('auth.seat.points.discountMsg', { amount: (pointsToUse * 100).toLocaleString() }) || `Được giảm: -${(pointsToUse * 100).toLocaleString()} VNĐ`}
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