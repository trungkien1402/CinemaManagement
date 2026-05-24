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
            // Thay vì dùng findAll() thông thường, bạn có thể gọi hàm findAllBookingsForAdmin()
            // đã viết sẵn trong TicketRepository để tối ưu Join Fetch tránh lỗi Lazy Loading.
            List<Ticket> tickets = ticketRepository.findAllBookingsForAdmin();
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
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã vé #" + ticketId + " trên hệ thống!"));

            // BƯỚC 1: Kiểm tra xem vé đã được thanh toán (BOOKED hoặc SUCCESS) chưa
            String payStatus = ticket.getStatusTicket();
            if (!"BOOKED".equals(payStatus) && !"SUCCESS".equals(payStatus)) {
                return ResponseEntity.badRequest().body("Lỗi check-in: Vé này chưa thanh toán thành công hoặc đã bị hủy (" + payStatus + ")!");
            }

            // BƯỚC 2: Kiểm tra trạng thái soát vé vào cửa (Dựa trên số Integer statusTk)
            if (ticket.getStatusTk() != null && ticket.getStatusTk() == 1) {
                return ResponseEntity.badRequest().body("Lỗi check-in: Vé này đã được quét soát vé và vào cửa trước đó rồi!");
            }

            // BƯỚC 3: Nếu vé hợp lệ và chưa dùng, tiến hành đổi trạng thái sang 1 (Đã dùng)
            ticket.setStatusTk(1);
            ticketRepository.save(ticket);

            return ResponseEntity.ok("Check-in soát vé thành công cho vé #" + ticketId);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống soát vé: " + e.getMessage());
        }
    }
}