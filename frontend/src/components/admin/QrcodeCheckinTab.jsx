import React from 'react';
import { useTranslation } from 'react-i18next'; // 👈 THÊM IMPORT BỘ DỊCH

const QrcodeCheckinTab = ({ manualTicketId, setManualTicketId, fireConfirmCheckin }) => {
    const { t } = useTranslation(); // 👈 KHỞI TẠO HOOK ĐỂ DỊCH CHỮ

    return (
        <div className="tab-view central-align-layout">
            <h2 className="tab-title">{t('admin.adminDashboard.qrcodeCheckinTab.title')}</h2>
            <div className="qr-scanner-mock-frame">
                <div id="qr-reader-view"></div>
            </div>
            <div className="manual-checkin-box">
                <p className="divider-text">{t('admin.adminDashboard.qrcodeCheckinTab.manualBox.divider')}</p>
                <div className="input-group-row">
                    <input 
                        type="text" 
                        placeholder={t('admin.adminDashboard.qrcodeCheckinTab.manualBox.placeholder')} 
                        value={manualTicketId} 
                        onChange={e => setManualTicketId(e.target.value)} 
                    />
                    <button 
                        onClick={() => fireConfirmCheckin(manualTicketId)} 
                        className="btn-trigger-action"
                    >
                        {t('admin.adminDashboard.qrcodeCheckinTab.manualBox.button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrcodeCheckinTab;