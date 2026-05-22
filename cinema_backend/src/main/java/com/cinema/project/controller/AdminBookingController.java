package com.cinema.project.controller;

import com.cinema.project.model.Ticket;
import com.cinema.project.repositories.TicketRepository;
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

    private final TicketRepository ticketRepository;

    // 1. LẤY TOÀN BỘ DANH SÁCH VÉ ĐẶT
    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<Ticket> tickets = ticketRepository.findAll();
            // Lưu ý bảo mật: Hãy chắc chắn các thuộc tính quan hệ trong Model Ticket
            // như @ManyToOne User, @ManyToOne Showtime đã được cấu hình FetchType.EAGER
            // hoặc không bị bỏ qua (@JsonIgnore) để tránh Frontend bị rỗng dữ liệu (null).
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy danh sách vé: " + e.getMessage());
        }
    }

    // 2. XỬ LÝ CHECK-IN QUÉT MÃ QR HOẶC NHẬP TAY THỦ CÔNG
    @PostMapping("/checkin/{ticketId}")
    public ResponseEntity<?> checkInTicket(@PathVariable String ticketId) {
        try {
            // Tìm vé theo ID (Tương thích với kiểu dữ liệu ID của TicketRepository, nếu ID là Long/Integer thì sửa thành Integer.parseInt(ticketId))
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã vé #" + ticketId + " trên hệ thống!"));

            // Kiểm tra trạng thái vé trước khi xử lý soát vé
            // Nếu trạng thái là COMPLETED (Đã thanh toán và chưa checkin) thì cho phép qua cửa
            if ("COMPLETED".equals(ticket.getStatus())) {
                // Đổi trạng thái thành "USED" hoặc "CHECKED_IN" tùy theo thiết kế Entity của bạn
                ticket.setStatus("USED");
                ticketRepository.save(ticket);

                return ResponseEntity.ok("Check-in thành công vé #" + ticketId);
            }

            // Trường hợp vé đã được sử dụng từ trước đó
            if ("USED".equals(ticket.getStatus()) || "CHECKED_IN".equals(ticket.getStatus())) {
                return ResponseEntity.badRequest().body("Lỗi check-in: Vé này đã được quét và sử dụng trước đó rồi!");
            }

            // Các trường hợp trạng thái không hợp lệ khác (Ví dụ: Vé bị hủy, chưa thanh toán)
            return ResponseEntity.badRequest().body("Lỗi check-in: Trạng thái vé không hợp lệ để check-in (" + ticket.getStatus() + ")");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống soát vé: " + e.getMessage());
        }
    }
}