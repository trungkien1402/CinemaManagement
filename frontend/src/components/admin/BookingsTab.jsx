import React from 'react';

const BookingsTab = ({ bookings }) => {
    return (
        <div className="tab-view">
            <h2 className="tab-title">Nhật Ký Giao Dịch Đặt Vé Toàn Hệ Thống</h2>
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr><th>Mã Hoá Đơn</th><th>Tài khoản</th><th>Tên Phim</th><th>Ghế</th><th>Giá Tiền</th><th>Ngày Đặt Vé</th><th>Trạng Thái</th></tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.ticketId}>
                                <td><code className="invoice-code">#{b.ticketId}</code></td>
                                <td>{b.user?.username || "Ẩn danh"}</td>
                                <td>{b.showtime?.movie?.title}</td>
                                <td><span className="seat-badge">{b.seat?.seatNumber}</span></td>
                                <td><strong>{b.totalPrice?.toLocaleString()}đ</strong></td>
                                <td>{b.bookingDate}</td>
                                <td><span className="status-label success">{b.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingsTab;