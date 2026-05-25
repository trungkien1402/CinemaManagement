package com.cinema.project.controller;

import com.cinema.project.model.Voucher;
import com.cinema.project.repositories.VoucherRepository;
import com.cinema.project.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;
    private final VoucherRepository voucherRepository;

    // ================= KHU VỰC DÀNH CHO ADMIN =================

    @GetMapping("/admin/vouchers/all")
    public ResponseEntity<List<Voucher>> getAllVouchersForAdmin() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping("/admin/vouchers/create")
    public ResponseEntity<?> createNewVoucher(@RequestBody Voucher voucher) {
        try {
            if (voucherRepository.existsById(voucher.getVoucherCode().trim().toUpperCase())) {
                return ResponseEntity.badRequest().body("Mã giảm giá này đã tồn tại trên hệ thống!");
            }
            Voucher savedVoucher = voucherService.createVoucher(voucher);
            return ResponseEntity.ok(savedVoucher);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo voucher: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/vouchers/delete/{code}")
    public ResponseEntity<?> deleteVoucher(@PathVariable String code) {
        try {
            voucherService.deleteVoucher(code);
            return ResponseEntity.ok("Xóa mã giảm giá thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa mã giảm giá!");
        }
    }

    // ================= KHU VỰC DÀNH CHO KHÁCH HÀNG (TRANG ĐẶT VÉ) =================

    @GetMapping("/vouchers/check")
    public ResponseEntity<?> checkVoucherValidity(@RequestParam String code) {
        Optional<Voucher> voucherOpt = voucherRepository.findById(code.trim().toUpperCase());

        if (!voucherOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Mã giảm giá không tồn tại!");
        }

        Voucher voucher = voucherOpt.get();

        if (voucher.getExpiryDate() != null && voucher.getExpiryDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Mã giảm giá này đã hết hạn sử dụng!");
        }

        if (voucher.getUsedCount() >= voucher.getMaxUses()) {
            return ResponseEntity.badRequest().body("Mã giảm giá này đã hết lượt sử dụng!");
        }

        return ResponseEntity.ok(voucher);
    }

    // 5. CẬP NHẬT TRỪ LƯỢT VOUCHER THEO PATH VARIABLE
    @PostMapping("/vouchers/apply/{code}")
    public ResponseEntity<?> applyVoucherSuccess(@PathVariable String code) {
        try {
            voucherService.applyVoucher(code);
            return ResponseEntity.ok("Áp dụng và trừ lượt voucher thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}