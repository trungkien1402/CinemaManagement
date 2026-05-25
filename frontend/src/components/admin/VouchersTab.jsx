import React from 'react';
import '../style/VouchersTab.css';

const VouchersTab = ({ saveVoucherObj, voucherForm, setVoucherForm, vouchers, deleteVoucherObj }) => {
    
    // Hàm xử lý thay đổi giá trị giảm giá để chặn lỗi nhập quá 100% khi chọn PERCENT
    const handleDiscountValueChange = (e) => {
        let value = parseFloat(e.target.value);
        
        if (isNaN(value)) {
            value = '';
        } else if (voucherForm.discountType === 'PERCENT') {
            if (value > 100) value = 100; // Tự động đưa về 100 nếu nhập lố
            if (value < 1) value = 1;     // Không cho phép nhập số âm hoặc bằng 0
        } else if (voucherForm.discountType === 'CASH') {
            if (value < 1) value = 1;     // Giá tiền mặt tối thiểu phải từ 1đ
        }

        setVoucherForm({ ...voucherForm, discountValue: value });
    };

    // Hàm tự động điều chỉnh lại giá trị giảm giá nếu Admin đổi qua lại giữa loại CASH và PERCENT
    const handleDiscountTypeChange = (e) => {
        const newType = e.target.value;
        let currentValue = voucherForm.discountValue;

        // Nếu chuyển sang PERCENT mà giá trị cũ đang lớn hơn 100, ép về 100
        if (newType === 'PERCENT' && currentValue > 100) {
            currentValue = 100;
        }

        setVoucherForm({ 
            ...voucherForm, 
            discountType: newType,
            discountValue: currentValue 
        });
    };

    return (
        <div className="vctab-container">
            <h2 className="vctab-main-title">Cơ Cấu Chương Trình Khuyến Mãi Voucher</h2>
            
            {/* Form phát hành Voucher */}
            <form onSubmit={saveVoucherObj} className="vctab-interactive-grid">
                
                {/* 1. Nhập mã Voucher */}
                <div className="vctab-form-item">
                    <label>Mã Khuyến Mãi:</label>
                    <input 
                        type="text" 
                        placeholder="Ví dụ: MOVIE2026" 
                        value={voucherForm.voucherCode || ''} 
                        onChange={e => setVoucherForm({...voucherForm, voucherCode: e.target.value.toUpperCase().trim()})} 
                        required 
                    />
                </div>
                
                {/* 2. Chọn loại giảm giá (CASH hoặc PERCENT) */}
                <div className="vctab-form-item">
                    <label>Hình thức giảm giá:</label>
                    <select 
                        value={voucherForm.discountType || 'PERCENT'} 
                        onChange={handleDiscountTypeChange}
                        required
                    >
                        <option value="PERCENT">Giảm giá theo Phần trăm (%)</option>
                        <option value="CASH">Giảm giá theo Số tiền mặt (đ)</option>
                    </select>
                </div>

                {/* 3. Nhập giá trị giảm giá (Đã tích hợp hàm lọc dữ liệu đầu vào) */}
                <div className="vctab-form-item">
                    <label>Mức giảm cụ thể:</label>
                    <input 
                        type="number" 
                        placeholder={voucherForm.discountType === 'CASH' ? "Số tiền giảm (Ví dụ: 20000)" : "Tỷ lệ giảm giá (1 - 100%)"} 
                        min="1" 
                        max={voucherForm.discountType === 'CASH' ? undefined : "100"}
                        value={voucherForm.discountValue ?? ''} 
                        onChange={handleDiscountValueChange} 
                        required 
                    />
                </div>

                {/* 4. Nhập số lượt sử dụng tối đa */}
                <div className="vctab-form-item">
                    <label>Số lượng phát hành:</label>
                    <input 
                        type="number" 
                        placeholder="Ví dụ: 100" 
                        min="1" 
                        value={voucherForm.maxUses || ''} 
                        onChange={e => setVoucherForm({...voucherForm, maxUses: parseInt(e.target.value, 10) || ''})} 
                        required 
                    />
                </div>

                {/* 5. Chọn hạn sử dụng */}
                <div className="vctab-form-item">
                    <label>Hạn sử dụng chương trình:</label>
                    <input 
                        type="date" 
                        value={voucherForm.expiryDate || ''} 
                        onChange={e => setVoucherForm({...voucherForm, expiryDate: e.target.value})} 
                        required 
                    />
                </div>

                <div className="vctab-form-item vctab-btn-align-bottom">
                    <button type="submit" className="vctab-submit-btn">🎁 Phát Hành Mã Quà Tặng</button>
                </div>
            </form>

            <hr className="vctab-divider" />

            {/* BẢNG THỂ HIỆN DANH SÁCH VOUCHER */}
            <div className="vctab-table-responsive">
                <table className="vctab-data-table">
                    <thead>
                        <tr>
                            <th>Mã Voucher</th>
                            <th>Loại & Mức giảm</th>
                            <th>Lượt dùng (Đã dùng / Tối đa)</th>
                            <th>Hạn sử dụng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers && vouchers.length > 0 ? (
                            vouchers.map(v => {
                                const currentUsed = Number(v.usedCount) || 0;
                                const maxAllowed = Number(v.maxUses) || 0;
                                const isRunOut = currentUsed >= maxAllowed;

                                return (
                                    <tr key={v.voucherCode} className={isRunOut ? 'vctab-row-disabled' : ''}>
                                        <td><code className="vctab-code-badge">{v.voucherCode}</code></td>
                                        <td>
                                            <span className={`vctab-badge ${v.discountType === 'PERCENT' ? 'percent' : 'cash'}`}>
                                                {v.discountType === 'PERCENT' ? `${v.discountValue}% OFF` : `${v.discountValue?.toLocaleString()}đ Giảm`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`vctab-counter ${isRunOut ? 'danger' : 'success'}`}>
                                                {currentUsed}
                                            </span>
                                            <span className="vctab-max-text"> / {maxAllowed}</span>
                                            {isRunOut && <span className="vctab-soldout-tag">Hết lượt</span>}
                                        </td>
                                        <td className="vctab-date-text">{v.expiryDate}</td>
                                        <td>
                                            <button 
                                                type="button"
                                                onClick={() => deleteVoucherObj(v.voucherCode)} 
                                                className="vctab-delete-btn"
                                            >
                                                Xóa bỏ
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="vctab-empty-row">
                                    Chưa có chương trình khuyến mãi nào được phát hành.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VouchersTab;