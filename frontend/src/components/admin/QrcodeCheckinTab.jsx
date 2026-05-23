import React from 'react';

const QrcodeCheckinTab = ({ manualTicketId, setManualTicketId, fireConfirmCheckin }) => {
    return (
        <div className="tab-view central-align-layout">
            <h2 className="tab-title">Cổng Soát Vé Tự Động (QR Gate)</h2>
            <div className="qr-scanner-mock-frame">
                <div id="qr-reader-view"></div>
            </div>
            <div className="manual-checkin-box">
                <p className="divider-text">HOẶC NHẬP MÃ VÉ THỦ CÔNG</p>
                <div className="input-group-row">
                    <input type="text" placeholder="Nhập mã Ticket ID (Ví dụ: 20)" value={manualTicketId} onChange={e => setManualTicketId(e.target.value)} />
                    <button onClick={() => fireConfirmCheckin(manualTicketId)} className="btn-trigger-action">Xác Nhận Check-In</button>
                </div>
            </div>
        </div>
    );
};

export default QrcodeCheckinTab;