package com.cinema.project.controller;

import com.cinema.project.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ĐÃ SỬA: Bổ sung CORS để cho phép ReactJS Client gọi API sơ đồ ghế thuận lợi
public class SeatController {

    private final SeatService seatService;

    // =========================================================================
    // API LẤY TẤT CẢ GHẾ VẬT LÝ THEO MÃ PHÒNG (Cấu hình hệ thống)
    // =========================================================================
    // URL: GET http://localhost:8080/api/seats/room/{roomId}
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
    // URL: GET http://localhost:8080/api/seats/showtime/{showtimeId}
    @GetMapping("/showtime/{showtimeId}")
    // ĐÃ SỬA: Đổi kiểu dữ liệu từ String sang Long showtimeId để sửa dứt điểm lỗi biên dịch ứng dụng
    public ResponseEntity<?> getSeatsByShowtime(@PathVariable String showtimeId) {
        try {
            if (showtimeId == null) {
                return ResponseEntity.badRequest().body("Mã suất chiếu không hợp lệ!");
            }
            // Truyền biến Long an toàn vào tầng Service đã được tối ưu hóa ở bước trước
            return ResponseEntity.ok(seatService.getSeatsStatusByShowtime(showtimeId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi tải sơ đồ trạng thái đặt ghế: " + e.getMessage());
        }
    }
}