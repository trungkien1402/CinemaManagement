package com.cinema.project.controller;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.Ticket;
import com.cinema.project.service.BookingService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // ===================== 1. ĐẶT VÉ VÀ GIỮ GHẾ =====================
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            List<Ticket> result = bookingService.processBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi đặt vé: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Hệ thống đặt vé gặp sự cố: " + e.getMessage());
        }
    }

    // ===================== 2. LẤY DANH SÁCH GHẾ ĐÃ KHÓA SUẤT CHIẾU =====================
    @GetMapping("/booked-seats/{showtimeId}")
    public ResponseEntity<?> getBookedSeats(@PathVariable String showtimeId) {
        try {
            List<String> bookedSeats = bookingService.getBookedSeats(showtimeId);
            return ResponseEntity.ok(bookedSeats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải sơ đồ ghế đã đặt: " + e.getMessage());
        }
    }

    // ===================== 3. XEM LỊCH SỬ ĐẶT VÉ CỦA USER =====================
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getBookingHistory(@PathVariable String userId) {
        try {
            List<Ticket> tickets = bookingService.getBookingHistory(userId);

            if (tickets.isEmpty()) {
                return ResponseEntity.ok("Bạn chưa có lịch sử đặt vé nào trên hệ thống.");
            }

            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải lịch sử đặt vé: " + e.getMessage());
        }
    }
}