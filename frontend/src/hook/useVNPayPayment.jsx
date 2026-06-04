import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useTranslation } from 'react-i18next';

export const useVNPayPayment = () => {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    const handleVNPayPayment = async ({ user, showtimeId, selectedSeats, totalAmount, navigate }) => {
        if (!user) {
            alert(t('payment.alerts.loginRequired') || "Vui lòng đăng nhập!");
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            alert(t('payment.alerts.selectSeat') || "Vui lòng chọn ít nhất 1 ghế!");
            return;
        }

        if (processing) return;

        try {
            setProcessing(true);
            const finalAmount = parseInt(totalAmount, 10);

            // 🚀 BÍ QUYẾT LÀ ĐÂY: Kéo dữ liệu đã lưu sẵn (có chứa pointsToUse và voucherCode) ra trước
            const savedPendingBooking = JSON.parse(localStorage.getItem("pendingBooking")) || {};

            // DỮ LIỆU BOOKING CHUẨN ĐỒNG BỘ VỚI BACKEND
            const bookingData = {
                ...savedPendingBooking, // 🚀 Trộn data cũ vào để không làm mất pointsToUse
                userId: user.userId || user.id, // Hỗ trợ cả 2 kiểu ID cho chắc cốp
                showtimeId: showtimeId,
                seatIds: selectedSeats.map((s) => s.seatId),
                totalPrice: finalAmount
            };

            // LƯU ĐÈ VÀO LOCALSTORAGE BẢN HOÀN CHỈNH
            localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

            console.log("=== ĐANG GỬI DATA QUA AXIOS CLIENT ===", bookingData);

            const response = await axiosClient.post("/payment/create", bookingData);

            if (response.data && response.data.paymentUrl) {
                const paymentUrl = response.data.paymentUrl;

                console.log("=== LINK VNPAY HỢP LỆ ===", paymentUrl);

                const triggerLink = document.createElement('a');
                triggerLink.href = paymentUrl;
                triggerLink.rel = 'noopener noreferrer';

                document.body.appendChild(triggerLink);
                triggerLink.click();
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