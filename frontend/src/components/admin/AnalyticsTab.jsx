import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsTab = ({ analytics }) => {
    
    // Tự động tính toán số liệu biểu đồ cột dựa trên dữ liệu thật từ API
    const generatedBarChartData = useMemo(() => {
        const monthsLabels = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
        const revenueValues = Array(12).fill(0);

        if (analytics?.monthlyData) {
            analytics.monthlyData.forEach(item => {
                const m = parseInt(item.month, 10);
                if (m >= 1 && m <= 12) revenueValues[m - 1] = item.revenue || 0;
            });
        }

        return {
            labels: monthsLabels,
            datasets: [{
                label: 'Doanh thu (đ)',
                data: revenueValues,
                backgroundColor: '#3b82f6',
                borderRadius: 4
            }]
        };
    }, [analytics]);

    // Tự động tính toán số liệu biểu đồ tròn dựa trên dữ liệu thật từ API
    const generatedDoughnutData = useMemo(() => {
        return {
            labels: analytics?.topMovies?.map(m => m.title) || [],
            datasets: [{
                data: analytics?.topMovies?.map(m => m.ticketsSold) || [],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 1
            }]
        };
    }, [analytics]);

    return (
        <div className="tab-view">
            <h2 className="tab-title">Báo Cáo Phân Tích Tài Chính</h2>
            
            <div className="metric-cards-row">
                <div className="metric-card card-green">
                    <h4>Tổng Doanh Thu Toàn Hệ Thống</h4>
                    <p className="number-display">{(analytics?.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="metric-card card-blue">
                    <h4>Tổng Số Lượng Vé Đã Bán</h4>
                    <p className="number-display">{analytics?.totalTickets || 0} Vé</p>
                </div>
            </div>

            <div className="visualization-grid">
                <div className="chart-wrapper">
                    <h5>📈 Thống kê doanh số theo tháng (Năm 2026)</h5>
                    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                        <Bar data={generatedBarChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
                
                <div className="chart-wrapper">
                    <h5>🎯 Thị phần doanh số theo Phim</h5>
                    {analytics?.topMovies?.length > 0 ? (
                        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                            <Doughnut data={generatedDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    ) : (
                        <p className="empty-text">Chưa ghi nhận dữ liệu phim</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;