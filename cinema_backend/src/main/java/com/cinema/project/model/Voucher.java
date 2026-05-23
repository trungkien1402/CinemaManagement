package com.cinema.project.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @Column(length = 50)
    private String voucherCode; // Ví dụ: MOVIES2026, GIAM20K

    @Column(nullable = false)
    private double discountValue; // Giá trị giảm (Ví dụ: 20000 hoặc 15)

    @Column(length = 20, nullable = false)
    private String discountType; // "CASH" (giảm tiền mặt) hoặc "PERCENT" (giảm %)

    @Column(nullable = false)
    private LocalDate expiryDate; // Ngày hết hạn

    @Column(nullable = false)
    private int maxUses; // Số lượt dùng tối đa ban đầu

    @Column(nullable = false)
    private int usedCount = 0; // Số lượt đã dùng thực tế

    // Getters and Setters
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public double getDiscountValue() { return discountValue; }
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }
    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }
}