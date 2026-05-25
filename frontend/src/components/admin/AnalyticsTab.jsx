import React, { useMemo, useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../api/axiosClient'; 
import '../style/AnalyticsTab.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsTab = ({ analytics }) => {
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

    // Cấu hình biểu đồ cột
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
                backgroundColor: '#26dc78', 
                hoverBackgroundColor: '#1a9664', 
                borderRadius: 4
            }]
        };
    }, [analytics]);

    // Cấu hình biểu đồ tròn
    const generatedDoughnutData = useMemo(() => {
        return {
            labels: analytics?.topMovies?.map(m => m.title) || [],
            datasets: [{
                data: analytics?.topMovies?.map(m => m.ticketsSold) || [],
                backgroundColor: ['#1bdc7c', '#991b1b', '#404040', '#171717', '#525252'], 
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
        <div className="antab-container">
            <h2 className="antab-main-title">Báo Cáo Phân Tích Tổng Quan</h2>
            
            {/* Hàng chứa các thẻ metric */}
            <div className="antab-metrics-row">
                
                {/* Thẻ 1: Tổng doanh thu */}
                <div className="antab-card antab-card-revenue">
                    <h4 className="antab-card-label">Tổng Doanh Thu Hệ Thống</h4>
                    <p className="antab-card-number">
                        {(analytics?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                    </p>
                </div>

                {/* Thẻ 2: Tổng số vé đã bán */}
                <div className="antab-card antab-card-tickets">
                    <h4 className="antab-card-label">Tổng Vé Đã Bán</h4>
                    <p className="antab-card-number">
                        {analytics?.totalTickets || 0} Vé
                    </p>
                </div>

                {/* Thẻ 3: Tổng số phim */}
                <div className="antab-card antab-card-movies">
                    <h4 className="antab-card-label">Tổng Số Phim Đang Quản Lý</h4>
                    <p className="antab-card-number">
                        {localTotalMovies} Phim
                    </p>
                </div>

                {/* Thẻ 4: Khách hàng */}
                <div className="antab-card antab-card-users">
                    <h4 className="antab-card-label">Khách Hàng Đăng Ký Hệ Thống</h4>
                    <p className="antab-card-number">
                        {localTotalUsers} Thành viên
                    </p>
                </div>

            </div>

            {/* Khu vực hiển thị biểu đồ */}
            <div className="antab-charts-grid">
                <div className="antab-chart-wrapper">
                    <h5 className="antab-chart-title">👑 Thống kê doanh số theo tháng (Năm 2026)</h5>
                    <div className="antab-chart-render-box">
                        <Bar data={generatedBarChartData} options={chartOptions} />
                    </div>
                </div>
                
                <div className="antab-chart-wrapper">
                    <h5 className="antab-chart-title">🎯 Thị phần doanh số theo Phim</h5>
                    {analytics?.topMovies?.length > 0 ? (
                        <div className="antab-chart-render-box">
                            <Doughnut data={generatedDoughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#e5e5e5' } } } }} />
                        </div>
                    ) : (
                        <p className="antab-chart-empty">Chưa ghi nhận dữ liệu phim</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;