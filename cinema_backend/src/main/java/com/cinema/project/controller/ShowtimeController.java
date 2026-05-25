package com.cinema.project.controller;

import com.cinema.project.model.Showtime;
import com.cinema.project.payload.response.SeatResponse;
import com.cinema.project.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor // Sử dụng Lombok thay cho tạo Constructor thủ công
@CrossOrigin(origins = "*")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    // ==========================================
    // 1. CLIENT LỌC SUẤT CHIẾU THEO CỤM RẠP VÀ NGÀY
    // ==========================================
    @GetMapping("/showtimes/filter")
    public ResponseEntity<?> getShowtimesByFilter(
            @RequestParam String theaterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        try {
            List<Showtime> filteredList = showtimeService.getShowtimesByFilter(theaterId, date);
            return ResponseEntity.ok(filteredList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lọc danh sách suất chiếu: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. CLIENT LẤY SƠ ĐỒ GHẾ ĐÃ ĐƯỢC PHÂN LOẠI
    // ==========================================
    @GetMapping("/showtimes/{showtimeId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsForShowtime(@PathVariable String showtimeId) {
        // Giữ nguyên kiểu trả về ResponseEntity<List<SeatResponse>> để không làm gãy code Frontend cũ
        List<SeatResponse> response = showtimeService.getSeatsForShowtime(showtimeId);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 3. ADMIN LẤY TẤT CẢ DANH SÁCH SUẤT CHIẾU
    // ==========================================
    @GetMapping("/admin/showtimes/all")
    public ResponseEntity<?> getAllShowtimesForAdmin() {
        try {
            return ResponseEntity.ok(showtimeService.getAllShowtimes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải toàn bộ suất chiếu: " + e.getMessage());
        }
    }

    // ==========================================
    // 4. ADMIN PHÁT HÀNH TẠO MỚI SUẤT CHIẾU
    // ==========================================
    @PostMapping("/admin/showtimes/create")
    public ResponseEntity<?> createShowtime(@RequestBody Map<String, Object> payload) {
        try {
            Showtime savedShowtime = showtimeService.createShowtime(payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedShowtime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo suất chiếu: " + e.getMessage());
        }
    }

    // ==========================================
    // 5. ADMIN LẤY BÁO CÁO THỐNG KÊ DOANH THU & BIỂU ĐỒ
    // ==========================================
    @GetMapping("/admin/showtimes-dashboard/summary")
    public ResponseEntity<?> getAdminAnalyticsSummary() {
        try {
            Map<String, Object> stats = showtimeService.getAdminAnalyticsSummary();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi tải báo cáo thống kê: " + e.getMessage());
        }
    }
}