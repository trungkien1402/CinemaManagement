import React from 'react';
import { useTranslation } from 'react-i18next'; 
import '../style/BookingTab.css';

const BookingsTab = ({ bookings }) => {
    // Lấy hàm t và đối tượng i18n ra để hỗ trợ đa ngôn ngữ và format ngày tháng
    const { t, i18n } = useTranslation(); 

    // Hàm phụ trợ để gán Class màu sắc tương ứng theo trạng thái vé
    const getStatusClass = (status) => {
        switch (status) {
            case 'SUCCESS':
            case 'BOOKED':
            case 'COMPLETED':
                return 'status-label success'; // Màu xanh lá
            case 'CANCELLED':
            case 'CANCELED':
                return 'status-label danger';  // Màu đỏ hủy vé
            default:
                return 'status-label default'; // Màu xám mặc định
        }
    };

    // Hàm định dạng hiển thị text trạng thái
    const getStatusText = (status) => {
        switch (status) {
            case 'SUCCESS':
            case 'BOOKED':
            case 'COMPLETED':
                return t('admin.adminDashboard.bookingsTab.status.paid') || 'Đã thanh toán';
            case 'CANCELLED':
            case 'CANCELED':
                return t('admin.adminDashboard.bookingsTab.status.canceled') || 'Đã hủy';
            default:
                return status || 'N/A';
        }
    };

    // Hàm xử lý hiển thị ngày tháng ISO sang chuỗi dễ đọc hơn
    const formatBookingDate = (dateString) => {
        if (!dateString) return "---";
        try {
            const date = new Date(dateString);
            // TỰ ĐỘNG SWITCH LOCALE: Tiếng Anh thì format US, tiếng Việt thì format VN
            const locale = i18n.language.startsWith('en') ? 'en-US' : 'vi-VN';
            return date.toLocaleString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="bktab-container tab-view">
            <h2 className="bktab-main-title tab-title">
                {t('admin.adminDashboard.bookingsTab.title') || "Nhật Ký Giao Dịch Đặt Vé Toàn Hệ Thống"}
            </h2>
            
            <div className="bktab-table-responsive table-responsive-box">
                <table className="bktab-data-table data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.bookingsTab.table.ticketId') || "Mã vé"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.username') || "Tài khoản"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.movieTitle') || "Tên phim"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.seats') || "Ghế"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.price') || "Tổng tiền"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.date') || "Ngày đặt"}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.status') || "Trạng thái"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings && bookings.length > 0 ? (
                            bookings.map(b => (
                                <tr key={b.ticketId}>
                                    <td><code className="bktab-invoice-code invoice-code">#{b.ticketId}</code></td>
                                    <td className="bktab-username">{b.user?.username || t('admin.adminDashboard.bookingsTab.anonymous') || "Ẩn danh"}</td>
                                    <td className="bktab-movie-title">{b.showtime?.movie?.title || "N/A"}</td>
                                    <td><span className="bktab-seat-badge seat-badge">{b.seat?.seatNumber || "N/A"}</span></td>
                                    <td><strong className="bktab-price">{b.totalPrice?.toLocaleString('vi-VN')}đ</strong></td>
                                    <td className="bktab-date">{formatBookingDate(b.bookingDate)}</td>
                                    <td>
                                        {(() => {
                                            // 1. ƯU TIÊN SỐ 1: Kiểm tra trạng thái Soát vé/Vào cửa trước (Dựa vào statusTk)
                                            if (b.statusTk === 1) {
                                                return <span className="bktab-status status-label success">{t('admin.adminDashboard.bookingsTab.status.statusTicked') || "Đã Check-in"}</span>;
                                            } 
                                            
                                            // 2. ƯU TIÊN SỐ 2: Nếu chưa Check-in, kiểm tra xem vé có bị HỦY không
                                            const currentStatus = (b.statusTicket || b.status || "").toUpperCase();
                                            if (currentStatus === 'CANCELLED' || currentStatus === 'CANCELED') {
                                                return <span className="bktab-status status-label danger">{t('admin.adminDashboard.bookingsTab.status.canceled') || "Đã Hủy"}</span>;
                                            }

                                            // 3. ƯU TIÊN SỐ 3: Nếu statusTk = 0 và vé ở trạng thái COMPLETED/SUCCESS bình thường
                                            if (b.statusTk === 0 || currentStatus === 'COMPLETED' || currentStatus === 'SUCCESS') {
                                                return <span className="bktab-status status-label warning">{t('admin.adminDashboard.bookingsTab.status.unused') || "Chưa sử dụng"}</span>;
                                            }

                                            // 4. Dự phòng cuối cùng nếu dữ liệu bị trống
                                            return <span className="bktab-status status-label default">{t('admin.adminDashboard.bookingsTab.status.unused') || "Chưa sử dụng"}</span>;
                                        })()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="bktab-empty-row" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
                                    {t('admin.adminDashboard.bookingsTab.empty') || "Chưa có dữ liệu giao dịch đặt vé nào."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingsTab;