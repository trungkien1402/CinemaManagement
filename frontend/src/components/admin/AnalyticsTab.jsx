import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

const AnalyticsTab = ({ analytics, barChartData, doughnutData }) => {
    const { t } = useTranslation(); 

    return (
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.analyticsTab.title')}</h2>
            <div className="metric-cards-row">
                <div className="metric-card card-green">
                    <h4>{t('admin.adminDashboard.analyticsTab.totalRevenue')}</h4>
                    <p className="number-display">{analytics.totalRevenue?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="metric-card card-blue">
                    <h4>{t('admin.adminDashboard.analyticsTab.totalTickets')}</h4>
                    <p className="number-display">{analytics.totalTickets || 0} {t('admin.adminDashboard.analyticsTab.ticketUnit')}</p>
                </div>
            </div>
            <div className="visualization-grid">
                <div className="chart-wrapper">
                    <h5>📈 {t('admin.adminDashboard.analyticsTab.monthlyChartTitle')}</h5>
                    <Bar data={barChartData} />
                </div>
                <div className="chart-wrapper">
                    <h5>🎯 {t('admin.adminDashboard.analyticsTab.movieChartTitle')}</h5>
                    {analytics.topMovies?.length > 0 ? (
                        <Doughnut data={doughnutData} />
                    ) : <p className="empty-text">{t('admin.adminDashboard.analyticsTab.emptyText')}</p>}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;