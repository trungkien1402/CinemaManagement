import React from 'react';
import { useTranslation } from 'react-i18next';

const VouchersTab = ({ saveVoucherObj, voucherForm, setVoucherForm, vouchers, deleteVoucherObj }) => {
    const { t } = useTranslation();

    return (
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.vouchersTab.title')}</h2>
            <form onSubmit={saveVoucherObj} className="interactive-form-grid">
                <input type="text" placeholder={t('admin.adminDashboard.vouchersTab.form.placeholders.voucherCode')} value={voucherForm.voucherCode} onChange={e => setVoucherForm({...voucherForm, voucherCode: e.target.value})} required />
                <input type="number" placeholder={t('admin.adminDashboard.vouchersTab.form.placeholders.discountPercent')} min="1" max="100" value={voucherForm.discountPercent} onChange={e => setVoucherForm({...voucherForm, discountPercent: parseInt(e.target.value)})} required />
                <input type="date" value={voucherForm.expiryDate} onChange={e => setVoucherForm({...voucherForm, expiryDate: e.target.value})} required />
                <button type="submit" className="form-submit-btn-main">🎁 {t('admin.adminDashboard.vouchersTab.form.buttons.submit')}</button>
            </form>
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.vouchersTab.table.voucherCode')}</th>
                            <th>{t('admin.adminDashboard.vouchersTab.table.discountPercent')}</th>
                            <th>{t('admin.adminDashboard.vouchersTab.table.expiryDate')}</th>
                            <th>{t('admin.adminDashboard.vouchersTab.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => (
                            <tr key={v.voucherCode}>
                                <td><code className="invoice-code">{v.voucherCode}</code></td>
                                <td><span className="badge-format">{v.discountPercent}% OFF</span></td>
                                <td>{v.expiryDate}</td>
                                <td>
                                    <button onClick={() => deleteVoucherObj(v.voucherCode)} className="control-btn btn-delete-sm">{t('admin.adminDashboard.vouchersTab.table.deleteBtn')}</button>
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