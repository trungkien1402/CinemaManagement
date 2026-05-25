import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from 'react-i18next'; 
import '../style/QrcodeCheckinTab.css';

const QrcodeCheckinTab = ({ manualTicketId, setManualTicketId, fireConfirmCheckin }) => {
    const { t } = useTranslation(); 

    useEffect(() => {
        // Cấu hình máy quét QR
        const scanner = new Html5QrcodeScanner(
            "qrtab-reader-view", // Phải trùng khớp với id của thẻ div bên dưới
            { 
                fps: 10,       // Số khung hình quét trên 1 giây
                qrbox: { width: 250, height: 250 }, // Kích thước vùng ô vuông quét mã
                rememberLastUsedCamera: true // Ghi nhớ camera đã chọn lần trước
            },
            /* verbose= */ false
        );

        // Hàm xử lý khi quét mã QR THÀNH CÔNG
        const onScanSuccess = (decodedText, decodedResult) => {
            console.log(`Mã QR quét được: ${decodedText}`);
            
            // Tự động điền mã QR quét được vào ô input thủ công để tiện theo dõi
            setManualTicketId(decodedText);
            
            // Kích hoạt hàm xác nhận check-in ngay lập tức
            fireConfirmCheckin(decodedText);
        };

        // Hàm xử lý khi quét thất bại
        const onScanFailure = (error) => {
            // Để trống để tránh tràn log console của trình duyệt
        };

        // Bắt đầu khởi chạy camera quét mã
        scanner.render(onScanSuccess, onScanFailure);

        // CLEANUP: Khi người dùng chuyển sang tab khác, tắt camera ngay lập tức để giải phóng thiết bị
        return () => {
            scanner.clear().catch(err => console.error("Lỗi khi tắt camera quét QR:", err));
        };
    }, [fireConfirmCheckin, setManualTicketId]);

    return (
        <div className="qrtab-container tab-view central-align-layout">
            <h2 className="qrtab-main-title tab-title">
                {t('admin.adminDashboard.qrcodeCheckinTab.title') || "Cổng Soát Vé Tự Động (QR Gate)"}
            </h2>
            
            {/* Khung bọc vùng Camera quét mã */}
            <div className="qrtab-scanner-frame qr-scanner-mock-frame">
                {/* Thư viện sẽ tự render camera vào bên trong thẻ id này */}
                <div id="qrtab-reader-view"></div>
            </div>
            
            {/* Khu vực nhập mã thủ công */}
            <div className="qrtab-manual-box manual-checkin-box">
                <p className="qrtab-divider-text divider-text">
                    {t('admin.adminDashboard.qrcodeCheckinTab.manualBox.divider') || "HOẶC NHẬP MÃ VÉ THỦ CÔNG"}
                </p>
                <div className="qrtab-input-group input-group-row">
                    <input 
                        type="text" 
                        placeholder={t('admin.adminDashboard.qrcodeCheckinTab.manualBox.placeholder') || "Nhập mã Ticket ID (Ví dụ: 20)"} 
                        value={manualTicketId} 
                        onChange={e => setManualTicketId(e.target.value)} 
                    />
                    <button 
                        onClick={() => fireConfirmCheckin(manualTicketId)} 
                        className="qrtab-action-btn btn-trigger-action"
                    >
                        {t('admin.adminDashboard.qrcodeCheckinTab.manualBox.button') || "Xác Nhận Check-In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QrcodeCheckinTab;