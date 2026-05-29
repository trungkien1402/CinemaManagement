import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState(t('payment.status.confirming') || "Đang xác nhận kết quả thanh toán...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [processing, setProcessing] = useState(true);

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
            const orderInfo = query.get("vnp_OrderInfo");
            
            // 🔍 ĐỌC DỮ LIỆU ĐỒNG BỘ TỪ LOCAL STORAGE
            const localData = localStorage.getItem("pendingBooking");
            console.log("=== MÃ PHẢN HỒI VNPAY ===", responseCode);
            console.log("=== DỮ LIỆU LOCAL STORAGE THÔ ===", localData);

            let bookingData = null;
            if (localData) {
                try {
                    bookingData = JSON.parse(localData);
                } catch (e) {
                    console.error("Lỗi parse JSON pendingBooking:", e);
                }
            }

            // =========================================================================
            // 1. ❌ TRƯỜNG HỢP HỦY THANH TOÁN (Mã 24) HOẶC LỖI KHÁC TỪ VNPAY (Khác 00)
            // =========================================================================
            if (responseCode !== "00") {
                if (responseCode === "24") {
                    setMessage(t('payment.status.canceled') || "Bạn đã hủy bỏ giao dịch thanh toán vé phim.");
                } else {
                    setMessage(t('payment.status.failed', { code: responseCode }) || `Giao dịch thất bại! Mã lỗi: VNPay_${responseCode}`);
                }
                
                setIsSuccess(false);
                playSound('fail');

                let seatIds = [];
                let showtimeId = "";

                // 👉 Hướng xử lý ưu tiên 1: Lấy từ Local Storage (Sửa đổi tên trường khớp 100% với dữ liệu thô)
                if (bookingData) {
                    showtimeId = bookingData.showtimeId || "";
                    if (bookingData.seatIds && Array.isArray(bookingData.seatIds)) {
                        seatIds = bookingData.seatIds; // Chuẩn hóa theo định dạng JSON thô bạn lưu
                    } else if (bookingData.selectedSeats && Array.isArray(bookingData.selectedSeats)) {
                        seatIds = bookingData.selectedSeats.map(s => s.seatId || s);
                    }
                } 
                
                // 👉 Hướng xử lý ưu tiên 2 (Dự phòng cực kỳ an toàn): Bóc tách chuỗi từ vnp_OrderInfo trên URL
                if (seatIds.length === 0 && orderInfo) {
                    console.log("Thử thách bóc tách thông tin từ vnp_OrderInfo URL:", orderInfo);
                    try {
                        // Giả sử Backend trả về info chứa mã lịch chiếu và ghế dạng: "ThanhToanVe_ST-53230_P01-E01,P01-E02"
                        const parts = orderInfo.split('_');
                        if (parts.length >= 3) {
                            showtimeId = parts[1];
                            seatIds = parts[2].split(',');
                        }
                    } catch (err) {
                        console.error("Lỗi bóc tách dữ liệu từ vnp_OrderInfo:", err);
                    }
                }

                // 🛠️ THỰC THI GỌI API NHẢ GHẾ KHẨN CẤP
                if (seatIds.length > 0 && showtimeId) {
                    console.log("💥 [KÍCH HOẠT] Tiến hành nhả các ghế dưới DB lập tức:", seatIds);
                    try {
                        const res = await axiosClient.post('/seats/release', { 
                            showtimeId: showtimeId, 
                            seatIds: seatIds 
                        });
                        console.log("✅ Kết quả hồi ghế từ Backend:", res.data);
                    } catch (err) {
                        console.error("❌ Gọi API hồi ghế thất bại:", err);
                    }
                } else {
                    console.warn("🛑 Không tìm thấy danh sách ID ghế từ Storage lẫn URL để tiến hành hồi ghế.");
                }

                // Luôn dọn dẹp bộ nhớ và giữ giao diện 2.5 giây cho khách hàng nhìn thông báo trước khi quay về
                localStorage.removeItem("pendingBooking");
                setProcessing(false);
                setTimeout(() => { navigate('/'); }, 2500);
                return;
            }

            // =========================================================================
            // 2. ✅ TRƯỜNG HỢP THÀNH CÔNG (Mã 00)
            // =========================================================================
            try {
                if (!bookingData) {
                    setMessage(t('payment.status.noPendingData') || "Không tìm thấy thông tin vé phim lưu tạm.");
                    setIsSuccess(false);
                    setProcessing(false);
                    playSound('fail');
                    setTimeout(() => { navigate('/'); }, 2500);
                    return;
                }

                // Đồng bộ cấu trúc dữ liệu nếu Backend yêu cầu `selectedSeats` thay vì `seatIds` khi tạo hóa đơn chính thức
                const payloadToCreate = { ...bookingData };
                if (payloadToCreate.seatIds && !payloadToCreate.selectedSeats) {
                    payloadToCreate.selectedSeats = payloadToCreate.seatIds.map(id => ({ seatId: id }));
                }

                // Tạo hóa đơn chính thức ở Backend
                await axiosClient.post("/bookings/create", payloadToCreate);
                
                const appliedVoucher = bookingData.voucherCode;
                if (appliedVoucher) {
                    await axiosClient.post(`/vouchers/apply/${appliedVoucher.trim().toUpperCase()}`);
                }

                localStorage.removeItem("pendingBooking");
                setMessage(t('payment.status.success') || "Thanh toán thành công! Vé phim đã được khởi tạo.");
                setIsSuccess(true);
                setProcessing(false);
                playSound('success'); 

                setTimeout(() => { navigate('/ve-da-dat'); }, 2500);

            } catch (err) {
                console.error("LỖI HỆ THỐNG KHI TẠO VÉ CHÍNH THỨC:", err);
                setMessage(t('payment.status.systemError') || "Lỗi hệ thống khi khởi tạo vé!");
                setIsSuccess(false);
                playSound('fail');

                // Dự phòng trường hợp lỗi mạng khi tạo vé, vẫn cố nhả ghế ra
                if (bookingData) {
                    const fallbackSeats = bookingData.seatIds || (bookingData.selectedSeats ? bookingData.selectedSeats.map(s => s.seatId || s) : []);
                    const fallbackShowtime = bookingData.showtimeId;
                    
                    if (fallbackSeats.length > 0 && fallbackShowtime) {
                        try {
                            await axiosClient.post('/seats/release', { 
                                showtimeId: fallbackShowtime, 
                                seatIds: fallbackSeats 
                            });
                        } catch (e) {
                            console.log("Hủy giữ ghế dự phòng thất bại:", e);
                        }
                    }
                }

                localStorage.removeItem("pendingBooking");
                setProcessing(false);
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