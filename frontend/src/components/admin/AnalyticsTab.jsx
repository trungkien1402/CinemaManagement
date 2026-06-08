import React, { useMemo, useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

import api from '../../api/axiosClient'; 
import '../style/AnalyticsTab.css';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Đăng ký các element của ChartJS (bắt buộc ở phiên bản mới)
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsTab = ({ analytics }) => {
    const { t } = useTranslation(); 
    const [localTotalMovies, setLocalTotalMovies] = useState(0);
    const [localTotalUsers, setLocalTotalUsers] = useState(0);

    useEffect(() => {
        const fetchLocalMetrics = async () => {
            try {
                const token = localStorage.getItem('token');
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };

                const movieRes = await api.get(`/movies/admin/all`, authHeader);
                if (movieRes.data && Array.isArray(movieRes.data)) {
                    setLocalTotalMovies(movieRes.data.length);
                }

                const userRes = await api.get('/admin/users/all', authHeader); 
                if (userRes.data && Array.isArray(userRes.data)) {
                    const onlyUsers = userRes.data.filter(u => u.role === 'ROLE_USER');
                    setLocalTotalUsers(onlyUsers.length);
                }
                
            } catch (err) {
                console.error("Lỗi khi lọc dữ liệu thành viên ở Frontend:", err);
            }
        };

        fetchLocalMetrics();
    }, []);

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
                label: t('admin.adminDashboard.analyticsTab.revenueLabel') || 'Doanh thu (đ)',
                data: revenueValues,
                backgroundColor: 'rgba(229, 9, 20, 0.8)', 
                hoverBackgroundColor: 'rgba(229, 9, 20, 1)', 
                borderRadius: 6
            }]
        };
    }, [analytics, t]);

    // Cấu hình biểu đồ tròn
    const generatedDoughnutData = useMemo(() => {
        return {
            labels: analytics?.topMovies?.map(m => m.title) || [],
            datasets: [{
                data: analytics?.topMovies?.map(m => m.ticketsSold) || [],
                backgroundColor: ['#e50914', '#e2b714', '#0ea5e9', '#10b981', '#a855f7', '#f43f5e', '#fb923c', '#94a3b8'], 
                borderWidth: 1,
                borderColor: '#121212'
            }]
        };
    }, [analytics]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e5e5e5' 
                }
            }
        },
        scales: {
            x: { grid: { color: '#262626' }, ticks: { color: '#a3a3a3' } },
            y: { grid: { color: '#262626' }, ticks: { color: '#a3a3a3' } }
        }
    };

    return (
        <div className="antab-container tab-view">
            <h2 className="antab-main-title tab-title">
                {t('admin.adminDashboard.analyticsTab.totalRevenue') || "Báo Cáo Phân Tích Tổng Quan"}
            </h2>
            
            {/* Hàng chứa các thẻ metric */}
            <div className="antab-metrics-row metric-cards-row">
                
                {/* Thẻ 1: Tổng doanh thu */}
                <div className="antab-card antab-card-revenue metric-card card-green">
                    <h4 className="antab-card-label">
                        {t('admin.adminDashboard.analyticsTab.totalRevenue') || "Tổng Doanh Thu Hệ Thống"}
                    </h4>
                    <p className="antab-card-number number-display">
                        {(analytics?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                    </p>
                </div>

                {/* Thẻ 2: Tổng số vé đã bán */}
                <div className="antab-card antab-card-tickets metric-card card-blue">
                    <h4 className="antab-card-label">
                        {t('admin.adminDashboard.analyticsTab.totalTickets') || "Tổng Vé Đã Bán"}
                    </h4>
                    <p className="antab-card-number number-display">
                        {analytics?.totalTickets || 0} {t('admin.adminDashboard.analyticsTab.ticketUnit') || "Vé"}
                    </p>
                </div>

                {/* Thẻ 3: Tổng số phim */}
                <div className="antab-card antab-card-movies metric-card">
                    <h4 className="antab-card-label">
                        {t('admin.adminDashboard.analyticsTab.totalMoviesManaged') || "Tổng Số Phim Đang Quản Lý"}
                    </h4>
                    <p className="antab-card-number number-display">
                        {localTotalMovies} {t('admin.adminDashboard.analyticsTab.movieUnit') || "Phim"}
                    </p>
                </div>

                {/* Thẻ 4: Khách hàng */}
                <div className="antab-card antab-card-users metric-card">
                    <h4 className="antab-card-label">
                        {t('admin.adminDashboard.analyticsTab.registeredUsers') || "Khách Hàng Đăng Ký Hệ Thống"}
                    </h4>
                    <p className="antab-card-number number-display">
                        {localTotalUsers} {t('admin.adminDashboard.analyticsTab.userUnit') || "Thành viên"}
                    </p>
                </div>

            </div>

            {/* Khu vực hiển thị biểu đồ */}
            <div className="antab-charts-grid visualization-grid">
                
                {/* Biểu đồ cột */}
                <div className="antab-chart-wrapper chart-wrapper">
                    <h5 className="antab-chart-title">
                         {t('admin.adminDashboard.analyticsTab.monthlyChartTitle') || "Thống kê doanh số theo tháng (Năm 2026)"}
                    </h5>
                    <div className="antab-chart-render-box" style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                        <Bar data={generatedBarChartData} options={chartOptions} />
                    </div>
                </div>
                
                {/* Biểu đồ tròn */}
                <div className="antab-chart-wrapper chart-wrapper">
                    <h5 className="antab-chart-title">
                         {t('admin.adminDashboard.analyticsTab.movieChartTitle') || "Thị phần doanh số theo Phim"}
                    </h5>
                    {analytics?.topMovies?.length > 0 ? (
                        <div className="antab-chart-render-box">
                            <Doughnut 
                                data={generatedDoughnutData} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false, 
                                    plugins: { legend: { labels: { color: '#e5e5e5' } } } 
                                }} 
                            />
                        </div>
                    ) : (
                        <p className="antab-chart-empty empty-text">
                            {t('admin.adminDashboard.analyticsTab.emptyText') || "Chưa ghi nhận dữ liệu phim"}
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AnalyticsTab;