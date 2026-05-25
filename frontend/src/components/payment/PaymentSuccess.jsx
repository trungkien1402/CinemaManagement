import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Sử dụng axios trần để tránh lỗi import đồng bộ
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState("Đang xác nhận kết quả thanh toán...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        let isCalled = false;

        const handlePaymentResult = async () => {
            if (isCalled) return;
            isCalled = true;

            try {
                // Bóc tách toàn bộ tham số VNPay trả về trên URL
                const query = new URLSearchParams(location.search);
                const responseCode = query.get("vnp_ResponseCode");

                console.log("=== MÃ PHẢN HỒI VNPAY ===", responseCode);

                // 1. TRƯỜNG HỢP NGƯỜI DÙNG BẤM HỦY THANH TOÁN (Mã 24)
                if (responseCode === "24") {
                    setMessage("Bạn đã hủy bỏ giao dịch thanh toán vé phim.");
                    setIsSuccess(false);
                    setProcessing(false);
                    
                    // Xóa dữ liệu đặt vé lưu tạm ngay lập tức để làm sạch bộ nhớ
                    localStorage.removeItem("pendingBooking");
                    return;
                }

                // 2. TRƯỜNG HỢP CÁC LỖI KHÁC TỪ VNPAY (Không phải 00)
                if (responseCode !== "00") {
                    setMessage(`Giao dịch thất bại! Mã lỗi hệ thống: VNP_${responseCode}`);
                    setIsSuccess(false);
                    setProcessing(false);
                    localStorage.removeItem("pendingBooking");
                    return;
                }

                // 3. TRƯỜNG HỢP THÀNH CÔNG (Mã 00) -> Tiến hành lưu vé vào Database
                const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));
                if (!bookingData) {
                    setMessage("Không tìm thấy thông tin vé phim lưu tạm (Có thể giao dịch đã được xử lý xong).");
                    setIsSuccess(false);
                    setProcessing(false);
                    return;
                }

                console.log("=== ĐANG GỬI LỆNH TẠO VÉ SANG BACKEND ===", bookingData);

                // Lấy token bảo mật từ bộ nhớ để chuẩn bị gửi kèm request
                const token = localStorage.getItem('token');
                const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

                // Gọi API tạo vé chính thức của bạn
                await axios.post("http://localhost:8080/api/bookings/create", bookingData, authHeader);
                
                // ================= TỰ ĐỘNG CẬP NHẬT LƯỢT DÙNG VOUCHER VÀO DB =================
                // Giả định bookingData của bạn có chứa trường voucherCode (hoặc couponCode tùy cấu hình object đặt vé của bạn)
                const appliedVoucher = bookingData.voucherCode || bookingData.couponCode;
                
                if (appliedVoucher) {
                    const cleanCode = appliedVoucher.trim().toUpperCase();
                    console.log(`=== ĐANG ĐỒNG BỘ TRỪ LƯỢT VOUCHER CHÍNH THỨC: ${cleanCode} ===`);
                    
                    // Gọi sang Endpoint Client mà bạn đã tạo ở Java Controller
                    await axios.post(`http://localhost:8080/api/vouchers/apply/${cleanCode}`, {}, authHeader);
                }
                // ===========================================================================

                // Giải phóng bộ nhớ tạm sau khi tạo vé và áp voucher thành công
                localStorage.removeItem("pendingBooking");

                setMessage("Thanh toán thành công! Vé phim của bạn đã được khởi tạo hệ thống.");
                setIsSuccess(true);

            } catch (err) {
                console.error("LỖI XỬ LÝ KẾT QUẢ:", err);
                setMessage(err.response?.data?.message || err.response?.data || "Lỗi hệ thống trong quá trình khởi tạo dữ liệu vé!");
                setIsSuccess(false);
            } finally {
                setProcessing(false);
            }
        };

        handlePaymentResult();
        return () => { isCalled = true; };
    }, [location]);

    return (
        <div style={{ background: "#0d0d13", color: "#fff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
            {/* Hiển thị Icon trạng thái động sinh động */}
            <div style={{ fontSize: "70px", marginBottom: "20px" }}>
                {processing ? "⏳" : isSuccess ? "✅" : "❌"}
            </div>
            
            {/* Lời nhắn thông báo */}
            <h2 style={{ textAlign: "center", maxWidth: "80%", fontWeight: "normal", lineHeight: "1.5" }}>
                {message}
            </h2>

            {/* Nút bấm điều hướng quay trở lại */}
            {!processing && (
                <button 
                    onClick={() => navigate('/')} 
                    style={{ 
                        marginTop: 35, 
                        padding: '12px 35px', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        border: 'none', 
                        borderRadius: 30, 
                        background: isSuccess ? '#28a745' : '#dc3545', 
                        color: '#fff', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {isSuccess ? "Vào rạp xem vé" : "Quay lại trang chủ"}
                </button>
            )}
        </div>
    );
};

export default PaymentSuccess;