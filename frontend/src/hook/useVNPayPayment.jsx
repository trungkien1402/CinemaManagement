import { useState } from 'react';
import axiosClient from '../api/axiosClient'; // Đảm bảo đúng đường dẫn tới axiosClient của bạn
import { useTranslation } from 'react-i18next'; // 👈 IMPORT THÊM I18N

export const useVNPayPayment = () => {
    const { t } = useTranslation(); // 👈 KHỞI TẠO HOOK
    const [processing, setProcessing] = useState(false);

    const handleVNPayPayment = async ({ user, showtimeId, selectedSeats, totalAmount, navigate }) => {
        // CHƯA LOGIN
        if (!user) {
            alert(t('payment.alerts.loginRequired') || "Vui lòng đăng nhập!");
            navigate('/login');
            return;
        }

        // CHƯA CHỌN GHẾ
        if (selectedSeats.length === 0) {
            alert(t('payment.alerts.selectSeat') || "Vui lòng chọn ít nhất 1 ghế!");
            return;
        }

        // PHÒNG CHỐNG CLICK ĐÚP 
        if (processing) return;

        try {
            setProcessing(true);

            // Ép kiểu số nguyên thuần túy
            const finalAmount = parseInt(totalAmount, 10);

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

            // Gọi qua axiosClient để đính kèm Authorization Token ở Header
            const response = await axiosClient.post("/payment/create", bookingData);

            // KIỂM TRA VÀ ĐIỀU HƯỚNG AN TOÀN BẰNG THẺ LINK CHÌM
            if (response.data && response.data.paymentUrl) {
                const paymentUrl = response.data.paymentUrl;
                
                console.log("=== LINK VNPAY HỢP LỆ ===", paymentUrl);
                
                // Thay thế window.location.href bằng cơ chế thẻ tạo link ảo 
                // Thêm rel='noopener noreferrer' để Chrome cho phép chuyển giao thức HTTPS -> HTTP localhost mượt mà
                const triggerLink = document.createElement('a');
                triggerLink.href = paymentUrl;
                triggerLink.rel = 'noopener noreferrer';
                
                document.body.appendChild(triggerLink);
                triggerLink.click(); // Kích hoạt lệnh chuyển hướng tự nhiên
                document.body.removeChild(triggerLink);
                
            } else {
                throw new Error(t('payment.errors.invalidUrl') || "Không nhận được paymentUrl hợp lệ từ Backend!");
            }

        } catch (err) {
            console.error("LỖI XỬ LÝ THANH TOÁN FRONTEND:", err);
            
            localStorage.removeItem("pendingBooking");

            alert(
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                t('payment.errors.initFailed') || "Khởi tạo giao dịch thanh toán thất bại!"
            );
        } finally {
            setProcessing(false);
        }
    };

    return {
        handleVNPayPayment,
        processing
    };
};