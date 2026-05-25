package com.cinema.project.controller;

import com.cinema.project.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

    // =========================================================================
    // API LẤY TẤT CẢ GHẾ VẬT LÝ THEO MÃ PHÒNG (Cấu hình hệ thống)
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
}