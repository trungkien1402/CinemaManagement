import React from 'react';
import { useTranslation } from 'react-i18next'; 
const BookingsTab = ({ bookings }) => {
    const { t } = useTranslation(); 
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
                        {bookings.map(b => (
                            <tr key={b.ticketId}>
                                <td><code className="invoice-code">#{b.ticketId}</code></td>
                                <td>{b.user?.username || t('admin.adminDashboard.bookingsTab.anonymous')}</td>
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