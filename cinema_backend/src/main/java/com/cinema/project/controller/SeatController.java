package com.cinema.project.controller;

import com.cinema.project.service.SeatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

    // =========================================================================
    // API LẤY TẤT CẢ GHẾ VẬT LÝ THEO MÃ PHÒNG (Cấu hình Admin)
    // =========================================================================
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getSeatsByRoom(@PathVariable String roomId) {
        try {
            return ResponseEntity.ok(seatService.getSeatsByRoom(roomId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi lấy danh sách cấu hình ghế: " + e.getMessage());
        }
    }

    // =========================================================================
    // API LẤY TRẠNG THÁI KHÓA/MỞ GHẾ THEO SUẤT CHIẾU (Phục vụ khách đặt vé)
    // =========================================================================
    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<?> getSeatsByShowtime(@PathVariable String showtimeId) {
        try {
            if (showtimeId == null || showtimeId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Mã suất chiếu không hợp lệ!");
            }
            return ResponseEntity.ok(seatService.getSeatsStatusByShowtime(showtimeId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi tải sơ đồ trạng thái đặt ghế: " + e.getMessage());
        }
    }

    // =========================================================================
    // ️ api: giữ ghế tạm thời (gọi trước khi react chuyển hướng sang vnpay)
    // =========================================================================
    @PostMapping("/hold")
    public ResponseEntity<?> holdSeats(@RequestBody SeatActionRequest request) {
        try {
            if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
                return ResponseEntity.badRequest().body("Danh sách ghế chọn không được để trống!");
            }
            seatService.holdSeats(request.getSeatIds());
            return ResponseEntity.ok("Giữ ghế thành công! Vui lòng hoàn tất thanh toán trong 10 phút.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Lỗi 400 kèm text thông báo ghế trùng
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi thực hiện giữ ghế tạm thời: " + e.getMessage());
        }
    }

    // =========================================================================
    // ️ api: giải phóng ghế (rollback khi nhận mã phản hồi hủy từ vnpay)
    // =========================================================================
    @PostMapping("/release")
    public ResponseEntity<?> releaseSeats(@RequestBody SeatActionRequest request) {
        try {
            if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
                return ResponseEntity.badRequest().body("Danh sách ghế giải phóng không hợp lệ!");
            }
            seatService.releaseSeats(request.getSeatIds());
            return ResponseEntity.ok("Đã giải phóng trạng thái giữ ghế thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi hủy giữ ghế: " + e.getMessage());
        }
    }

    // DTO Inner Class hứng dữ liệu JSON từ Frontend gửi lên
    @Data
    public static class SeatActionRequest {
        private String showtimeId;
        private List<String> seatIds;
        private String userId;
    }
}