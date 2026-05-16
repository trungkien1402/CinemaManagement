package com.cinema.project.controller;

import com.cinema.project.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Mở cửa cho React cổng 5173 truy cập
public class SeatController {

    private final SeatService seatService;

    // Giữ lại API cũ của Triển để hệ thống không bị lỗi cấu trúc liên kết
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getSeatsByRoom(@PathVariable String roomId) {
        try {
            return ResponseEntity.ok(seatService.getSeatsByRoom(roomId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách ghế: " + e.getMessage());
        }
    }

    // 💡 API MỚI TOÀN DIỆN: React sẽ gọi: GET http://localhost:8080/api/seats/showtime/ST01
    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<?> getSeatsByShowtime(@PathVariable String showtimeId) {
        try {
            return ResponseEntity.ok(seatService.getSeatsStatusByShowtime(showtimeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy trạng thái ghế theo suất chiếu: " + e.getMessage());
        }
    }
}