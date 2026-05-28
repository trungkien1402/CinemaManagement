import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient'; // Dùng chung axiosClient của hệ thống bạn
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState(t('payment.status.confirming') || "Đang xác nhận kết quả thanh toán...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [processing, setProcessing] = useState(true);

    // 🔊 HÀM PHÁT ÂM THANH THEO TRẠNG THÁI (Lấy file từ thư mục public/)
    const playSound = (type) => {
        try {
            const audioPath = type === 'success' ? '/success-sound.mp3' : '/fail-sound.mp3';
            const audio = new Audio(audioPath);
            audio.volume = 0.5;
            audio.play();
        } catch (error) {
            console.log("Trình duyệt chặn phát âm thanh tự động:", error);
        }
    };

    useEffect(() => {
        let isCalled = false;

        const handlePaymentResult = async () => {
            if (isCalled) return;
            isCalled = true;

            const query = new URLSearchParams(location.search);
            const responseCode = query.get("vnp_ResponseCode");
            const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));

            console.log("=== MÃ PHẢN HỒI VNPAY ===", responseCode);

            try {
                // 1. ❌ TRƯỜNG HỢP HỦY THANH TOÁN (Mã 24)
                if (responseCode === "24") {
                    setMessage(t('payment.status.canceled') || "Bạn đã hủy bỏ giao dịch thanh toán vé phim.");
                    setIsSuccess(false);
                    setProcessing(false);

                    // 🛠️ THỰC HIỆN ROLLBACK NHẢ GHẾ
                    if (bookingData && bookingData.selectedSeats) {
                        const seatIds = bookingData.selectedSeats.map(s => s.seatId);
                        await axiosClient.post('/seats/release', { 
                            showtimeId: bookingData.showtimeId, 
                            seatIds: seatIds 
                        });
                        console.log("-> Đã Rollback nhả các ghế:", seatIds);
                    }

                    localStorage.removeItem("pendingBooking");
                    playSound('fail'); 
                    setTimeout(() => { navigate('/'); }, 2500); 
                    return;
                }

                // 2. ❌ TRƯỜNG HỢP LỖI KHÁC TỪ CỔNG VNPAY
                if (responseCode !== "00") {
                    setMessage(t('payment.status.failed', { code: responseCode }) || `Giao dịch thất bại! Mã lỗi: VNPay_${responseCode}`);
                    setIsSuccess(false);
                    setProcessing(false);

                    // 🛠️ THỰC HIỆN ROLLBACK NHẢ GHẾ DO LỖI GIAO DỊCH
                    if (bookingData && bookingData.selectedSeats) {
                        const seatIds = bookingData.selectedSeats.map(s => s.seatId);
                        await axiosClient.post('/seats/release', { 
                            showtimeId: bookingData.showtimeId, 
                            seatIds: seatIds 
                        });
                    }

                    localStorage.removeItem("pendingBooking");
                    playSound('fail');
                    setTimeout(() => { navigate('/'); }, 2500);
                    return;
                }

                // 3. ✅ TRƯỜNG HỢP THÀNH CÔNG (Mã 00)
                if (!bookingData) {
                    setMessage(t('payment.status.noPendingData') || "Không tìm thấy thông tin vé phim lưu tạm.");
                    setIsSuccess(false);
                    setProcessing(false);
                    playSound('fail');
                    setTimeout(() => { navigate('/'); }, 2500);
                    return;
                }

                // Tiến hành tạo hóa đơn/vé chính thức ở Backend
                await axiosClient.post("/bookings/create", bookingData);
                
                // Nếu có dùng voucher thì cập nhật lượt sử dụng voucher vào DB
                const appliedVoucher = bookingData.voucherCode;
                if (appliedVoucher) {
                    await axiosClient.post(`/vouchers/apply/${appliedVoucher.trim().toUpperCase()}`);
                }

                localStorage.removeItem("pendingBooking");

                setMessage(t('payment.status.success') || "Thanh toán thành công! Vé phim đã được khởi tạo.");
                setIsSuccess(true);
                setProcessing(false);
                playSound('success'); 

                // ⏳ 2.5 giây sau tự động nhảy sang trang xem lịch sử vé
                setTimeout(() => { navigate('/ve-da-dat'); }, 2500);

            } catch (err) {
                console.error("LỖI XỬ LÝ HỆ THỐNG:", err);
                setMessage(t('payment.status.systemError') || "Lỗi hệ thống khi khởi tạo vé!");
                setIsSuccess(false);
                setProcessing(false);

                // 🛠️ ĐỀ PHÒNG SẬP MẠNG BACKEND KHI TẠO VÉ -> VẪN PHẢI GIẢI PHÓNG GHẾ
                if (bookingData && bookingData.selectedSeats) {
                    const seatIds = bookingData.selectedSeats.map(s => s.seatId);
                    axiosClient.post('/seats/release', { 
                        showtimeId: bookingData.showtimeId, 
                        seatIds: seatIds 
                    }).catch(e => console.log(e));
                }

                localStorage.removeItem("pendingBooking");
                playSound('fail'); 
                setTimeout(() => { navigate('/'); }, 2500);
            }
        };

        handlePaymentResult();
        return () => { isCalled = true; };
    }, [location, t, navigate]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#161622', color: '#fff', padding: '30px 40px', borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                maxWidth: '400px', width: '90%', textAlign: 'center',
                animation: 'popupScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                fontFamily: 'Arial, sans-serif'
            }}>
                <style>{`
                    @keyframes popupScale {
                        from { opacity: 0; transform: scale(0.85); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>

                <div style={{ fontSize: '50px', marginBottom: '15px' }}>
                    {processing ? "⏳" : isSuccess ? "✅" : "❌"}
                </div>

                <h3 style={{ 
                    fontSize: '18px', fontWeight: '600', margin: 0, lineHeight: '1.5',
                    color: processing ? '#ffc107' : isSuccess ? '#28a745' : '#dc3545'
                }}>
                    {processing ? "Đang xử lý" : isSuccess ? "Thành công" : "Thất bại"}
                </h3>
                
                <p style={{ fontSize: '14px', color: '#aaa', marginTop: '10px', marginBottom: 0, lineHeight: '1.4' }}>
                    {message}
                </p>

                {!processing && (
                    <div style={{ marginTop: '20px', width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', background: isSuccess ? '#28a745' : '#dc3545', width: '100%',
                            animation: 'countdown 2.5s linear forwards'
                        }} />
                        <style>{`
                            @keyframes countdown { from { width: 100%; } to { width: 0%; } }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;