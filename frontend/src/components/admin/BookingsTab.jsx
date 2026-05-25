import React from 'react';
import '../style/BookingTab.css';

const BookingsTab = ({ bookings }) => {
    // Xử lý hiển thị ngày tháng ISO sang chuỗi dễ đọc
    const formatBookingDate = (dateString) => {
        if (!dateString) return "---";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
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
        <div className="bktab-container">
            <h2 className="bktab-main-title">Nhật Ký Giao Dịch Đặt Vé Toàn Hệ Thống</h2>
            
            <div className="bktab-table-responsive">
                <table className="bktab-data-table">
                    <thead>
                        <tr>
                            <th>Mã Hoá Đơn</th>
                            <th>Tài khoản</th>
                            <th>Tên Phim</th>
                            <th>Ghế</th>
                            <th>Giá Tiền</th>
                            <th>Ngày Đặt Vé</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings && bookings.length > 0 ? (
                            bookings.map(b => (
                                <tr key={b.ticketId}>
                                    <td><code className="bktab-invoice-code">#{b.ticketId}</code></td>
                                    <td className="bktab-username">{b.user?.username || "Ẩn danh"}</td>
                                    <td className="bktab-movie-title">{b.showtime?.movie?.title || "N/A"}</td>
                                    <td><span className="bktab-seat-badge">{b.seat?.seatNumber || "N/A"}</span></td>
                                    <td><strong className="bktab-price">{b.totalPrice?.toLocaleString('vi-VN')}đ</strong></td>
                                    <td className="bktab-date">{formatBookingDate(b.bookingDate)}</td>
                                    <td>
                                        {(() => {
                                            // 1. ƯU TIÊN SỐ 1: Kiểm tra trạng thái Soát vé/Vào cửa trước (Dựa vào statusTk)
                                            if (b.statusTk === 1) {
                                                return <span className="bktab-status success">Đã Check-in</span>;
                                            } 
                                            
                                            // 2. ƯU TIÊN SỐ 2: Nếu chưa Check-in, kiểm tra xem vé có bị HỦY không
                                            const currentStatus = (b.statusTicket || b.status || "").toUpperCase();
                                            if (currentStatus === 'CANCELLED' || currentStatus === 'CANCELED') {
                                                return <span className="bktab-status danger">Đã Hủy</span>;
                                            }

                                            // 3. ƯU TIÊN SỐ 3: Nếu statusTk = 0 và vé ở trạng thái COMPLETED/SUCCESS bình thường
                                            if (b.statusTk === 0 || currentStatus === 'COMPLETED' || currentStatus === 'SUCCESS') {
                                                return <span className="bktab-status warning">Chưa sử dụng</span>;
                                            }

                                            // 4. Dự phòng cuối cùng nếu dữ liệu bị trống
                                            return <span className="bktab-status default">Chưa sử dụng</span>;
                                        })()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="bktab-empty-row">
                                    Chưa có dữ liệu giao dịch đặt vé nào.
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