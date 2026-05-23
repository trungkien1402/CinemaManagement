import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

const AnalyticsTab = ({ analytics, barChartData, doughnutData }) => {
    return (
        <div className="tab-view">
            <h2 className="tab-title">Báo Cáo Phân Tích Tài Chính</h2>
            <div className="metric-cards-row">
                <div className="metric-card card-green">
                    <h4>Tổng Doanh Thu Toàn Hệ Thống</h4>
                    <p className="number-display">{analytics.totalRevenue?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="metric-card card-blue">
                    <h4>Tổng Số Lượng Vé Đã Bán</h4>
                    <p className="number-display">{analytics.totalTickets || 0} Vé</p>
                </div>
            </div>
            <div className="visualization-grid">
                <div className="chart-wrapper">
                    <h5>📈 Thống kê doanh số theo tháng (Năm 2026)</h5>
                    <Bar data={barChartData} />
                </div>
                <div className="chart-wrapper">
                    <h5>🎯 Thị phần doanh số theo Phim</h5>
                    {analytics.topMovies?.length > 0 ? (
                        <Doughnut data={doughnutData} />
                    ) : <p className="empty-text">Chưa ghi nhận dữ liệu phim</p>}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;