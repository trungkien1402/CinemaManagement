package com.cinema.project.service;

import com.cinema.project.model.Voucher;
import com.cinema.project.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final NotificationService notificationService;

    // Lấy toàn bộ mã voucher hiển thị lên bảng admin
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    // Lưu voucher mới tạo hoặc cập nhật chuẩn xác
    public Voucher createVoucher(Voucher voucher) {
        if (voucher.getVoucherCode() != null) {
            String cleanCode = voucher.getVoucherCode().trim().toUpperCase();
            voucher.setVoucherCode(cleanCode);

            // CHỈ GÁN BẰNG 0 NẾU LÀ VOUCHER TẠO MỚI TINH
            // Nếu mã đã tồn tại (hành động update), ta giữ nguyên usedCount cũ của nó
            boolean isExists = voucherRepository.existsById(cleanCode);
            if (!isExists) {
                voucher.setUsedCount(0);
                
                // TẠO THÔNG BÁO CHO TẤT CẢ NGƯỜI DÙNG KHI CÓ VOUCHER MỚI
                try {
                    String discountText = voucher.getDiscountType().equals("PERCENT") 
                        ? (voucher.getDiscountValue() + "%") 
                        : (String.format("%,.0fđ", (double) voucher.getDiscountValue()));
                    String notificationTitle = "Mã giảm giá mới: " + cleanCode;
                    String notificationMessage = "CinemaX tung mã giảm giá " + cleanCode + " cực hot: giảm ngay " 
                        + discountText + " cho tất cả các giao dịch đặt vé nhanh tay áp dụng ngay! Hạn dùng đến: " + voucher.getExpiryDate();
                    
                    notificationService.createNotification(notificationTitle, notificationMessage, "VOUCHER");
                } catch (Exception e) {
                    System.err.println("Lỗi khi tạo thông báo phát hành voucher: " + e.getMessage());
                }
            } else {
                // Giữ lại số lượt dùng hiện tại trong DB thay vì reset về 0
                voucherRepository.findById(cleanCode).ifPresent(oldVoucher -> {
                    voucher.setUsedCount(oldVoucher.getUsedCount());
                });
            }
        }
        return voucherRepository.save(voucher);
    }

    // Xóa voucher theo mã code
    public void deleteVoucher(String voucherCode) {
        voucherRepository.deleteById(voucherCode.trim().toUpperCase());
    }

    @Transactional
    public void applyVoucher(String code) {
        String cleanCode = code.trim().toUpperCase();
        int updatedRows = voucherRepository.incrementUsedCount(cleanCode);
        if (updatedRows == 0) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng hoặc không tồn tại!");
        }
    }
}