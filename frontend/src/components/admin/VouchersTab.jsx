import React from 'react';

const VouchersTab = ({ saveVoucherObj, voucherForm, setVoucherForm, vouchers, deleteVoucherObj }) => {
    return (
        <div className="tab-view">
            <h2 className="tab-title">Cơ Cấu Chương Trình Khuyến Mãi Voucher</h2>
            <form onSubmit={saveVoucherObj} className="interactive-form-grid">
                <input type="text" placeholder="Mã Khuyến Mãi (Ví dụ: MOVIE2026)" value={voucherForm.voucherCode} onChange={e => setVoucherForm({...voucherForm, voucherCode: e.target.value})} required />
                <input type="number" placeholder="Tỷ lệ giảm giá (%)" min="1" max="100" value={voucherForm.discountPercent} onChange={e => setVoucherForm({...voucherForm, discountPercent: parseInt(e.target.value)})} required />
                <input type="date" value={voucherForm.expiryDate} onChange={e => setVoucherForm({...voucherForm, expiryDate: e.target.value})} required />
                <button type="submit" className="form-submit-btn-main">🎁 Phát Hành Mã Quà Tặng</button>
            </form>
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr><th>Mã Voucher</th><th>Phần trăm chiết khấu</th><th>Hạn sử dụng</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => (
                            <tr key={v.voucherCode}>
                                <td><code className="invoice-code">{v.voucherCode}</code></td>
                                <td><span className="badge-format">{v.discountPercent}% OFF</span></td>
                                <td>{v.expiryDate}</td>
                                <td>
                                    <button onClick={() => deleteVoucherObj(v.voucherCode)} className="control-btn btn-delete-sm">Xóa bỏ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VouchersTab;