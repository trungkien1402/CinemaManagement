package com.cinema.project.controller;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.Ticket;
import com.cinema.project.repositories.TicketRepository;
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
    private final TicketRepository ticketRepository;

    // ===================== ĐẶT VÉ VÀ GIỮ GHẾ (NEW) =====================
    // Endpoint: POST http://localhost:8080/api/bookings/create
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            // Nghiệp vụ xử lý đặt vé, kiểm tra ghế trống, tính tiền, áp dụng voucher nằm trong Service
            List<Ticket> result = bookingService.processBooking(request);

            // Trả về danh sách vé đặt thành công kèm mã TicketId để frontend sinh mã QR Code
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            // Bắt các lỗi nghiệp vụ như: "Ghế này đã có người đặt", "Voucher hết hạn", v.v.
            return ResponseEntity.badRequest().body("Lỗi đặt vé: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Hệ thống đặt vé gặp sự cố: " + e.getMessage());
        }
    }

    // ===================== API LẤY DANH SÁCH GHẾ ĐÃ BỊ KHÓA / ĐÃ ĐẶT =====================
    // Đã sửa: Đổi @PathVariable sang Long showtimeId để đồng bộ kiểu dữ liệu ID của Suất chiếu
    // Endpoint: GET http://localhost:8080/api/bookings/booked-seats/{showtimeId}
    @GetMapping("/booked-seats/{showtimeId}")
    public ResponseEntity<?> getBookedSeats(@PathVariable String showtimeId) {
        try {
            // Hàm này trả về một mảng danh sách tên ghế/ID ghế đã bán (Ví dụ: ["A01", "A02", "B15"])
            // Giúp màn hình chọn ghế ở Frontend Client tự động chuyển các ghế này thành màu ĐỎ và disable click.
            List<String> bookedSeats = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);
            return ResponseEntity.ok(bookedSeats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải sơ đồ ghế đã đặt: " + e.getMessage());
        }
    }

    // ===================== LỊCH SỬ ĐẶT VÉ CỦA USER =====================
    // Endpoint: GET http://localhost:8080/api/bookings/history/{userId}
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getBookingHistory(@PathVariable String userId) {
        try {
            List<Ticket> tickets = ticketRepository.findByUserId(userId);

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