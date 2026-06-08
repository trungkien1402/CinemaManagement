package com.cinema.project.controller;

import com.cinema.project.model.Ticket;
import com.cinema.project.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    // 1. LẤY TOÀN BỘ DANH SÁCH VÉ ĐẶT
    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<Ticket> tickets = adminBookingService.getAllTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy danh sách vé: " + e.getMessage());
        }
    }

    // 2. XỬ LÝ CHECK-IN QUÉT MÃ QR HOẶC NHẬP TAY THỦ CÔNG
    // đổi từ @postmapping thành @putmapping để không bị lỗi 405 method not allowed
    @PutMapping("/checkin/{ticketId}")
    public ResponseEntity<?> checkInTicket(@PathVariable String ticketId) {
        try {
            String resultMessage = adminBookingService.checkInTicket(ticketId);
            return ResponseEntity.ok(resultMessage);
        } catch (IllegalArgumentException | IllegalStateException e) {
            // Bắt các lỗi nghiệp vụ được throw từ tầng Service (Sai ID, vé chưa thanh toán, vé đã dùng)
            return ResponseEntity.badRequest().body("Lỗi check-in: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống soát vé: " + e.getMessage());
        }
    }
}