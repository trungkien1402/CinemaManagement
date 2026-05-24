import React from 'react';
import { useTranslation } from 'react-i18next'; 

const BookingsTab = ({ bookings }) => {
    // 💡 Lấy thêm i18n ra để check ngôn ngữ format ngày tháng
    const { t, i18n } = useTranslation(); 

    // Hàm phụ trợ để gán Class màu sắc tương ứng theo trạng thái vé
    const getStatusClass = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'status-label success'; // Màu xanh lá
            case 'BOOKED':
                return 'status-label warning'; // Màu vàng / cam cảnh báo
            case 'COMPLETED':                  // Thêm COMPLETED nếu backend dùng từ này
                return 'status-label success';
            case 'CANCELLED':
            case 'CANCELED':
                return 'status-label danger';  // Màu đỏ hủy vé
            default:
                return 'status-label default'; // Màu xám mặc định
        }
    };

    // Hàm định dạng hiển thị text trạng thái Tiếng Việt (Tùy chọn giúp UI thân thiện hơn)
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
            // 💡 TỰ ĐỘNG SWITCH LOCALE: Tiếng Anh thì format US, tiếng Việt thì format VN
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
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.bookingsTab.title')}</h2>
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.bookingsTab.table.ticketId')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.username')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.movieTitle')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.seats')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.price')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.date')}</th>
                            <th>{t('admin.adminDashboard.bookingsTab.table.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings && bookings.length > 0 ? (
                            bookings.map(b => (
                                <tr key={b.ticketId}>
                                    <td><code className="invoice-code">#{b.ticketId}</code></td>
                                    <td>{b.user?.username || t('admin.adminDashboard.bookingsTab.anonymous') || "Ẩn danh"}</td>
                                    <td>{b.showtime?.movie?.title || "N/A"}</td>
                                    <td><span className="seat-badge">{b.seat?.seatNumber || "N/A"}</span></td>
                                    <td><strong>{b.totalPrice?.toLocaleString('vi-VN')}đ</strong></td>
                                    <td>{formatBookingDate(b.bookingDate)}</td>
                                    
                                    {/* SỬA LỖI BIẾN: Chuyển từ ticket.statusTicket thành b.statusTicket */}
                                    <td>
                                        {(() => {
                                            // 1. ƯU TIÊN SỐ 1: Kiểm tra trạng thái Soát vé/Vào cửa trước (Dựa vào statusTk)
                                            if (b.statusTk === 1) {
                                                return <span className="status-label success">{t('admin.adminDashboard.bookingsTab.status.checkedIn') || "Đã Check-in"}</span>;
                                            } 
                                            
                                            // 2. ƯU TIÊN SỐ 2: Nếu chưa Check-in (statusTk === 0 hoặc chưa có), kiểm tra xem vé có bị HỦY không
                                            const currentStatus = (b.statusTicket || b.status || "").toUpperCase();
                                            if (currentStatus === 'CANCELLED' || currentStatus === 'CANCELED') {
                                                return <span className="status-label danger">{t('admin.adminDashboard.bookingsTab.status.canceled') || "Đã Hủy"}</span>;
                                            }

                                            // 3. ƯU TIÊN SỐ 3: Nếu statusTk = 0 và vé ở trạng thái COMPLETED/SUCCESS bình thường
                                            if (b.statusTk === 0 || currentStatus === 'COMPLETED' || currentStatus === 'SUCCESS') {
                                                return <span className="status-label warning">{t('admin.adminDashboard.bookingsTab.status.unused') || "Chưa sử dụng"}</span>;
                                            }

                                            // 4. Dự phòng cuối cùng nếu dữ liệu bị trống
                                            return <span className="status-label default">{t('admin.adminDashboard.bookingsTab.status.unused') || "Chưa sử dụng"}</span>;
                                        })()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
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