package com.cinema.project.service;

import com.cinema.project.model.Ticket;
import com.cinema.project.repositories.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final TicketRepository ticketRepository;

    // 1. Logic lấy toàn bộ danh sách vé đặt cho Admin
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllBookingsForAdmin();
    }

    // 2. Logic xử lý Check-in soát vé
    @Transactional
    public String checkInTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã vé #" + ticketId + " trên hệ thống!"));

        // BƯỚC 1: Kiểm tra trạng thái thanh toán của vé
        String payStatus = ticket.getStatusTicket();
        if (!"BOOKED".equals(payStatus) && !"SUCCESS".equals(payStatus)) {
            throw new IllegalStateException("Vé này chưa thanh toán thành công hoặc đã bị hủy (" + payStatus + ")!");
        }

        // BƯỚC 2: Kiểm tra xem vé đã quét trước đó chưa
        if (ticket.getStatusTk() != null && ticket.getStatusTk() == 1) {
            throw new IllegalStateException("Vé này đã được quét soát vé và vào cửa trước đó rồi!");
        }

        // BƯỚC 3: Cập nhật trạng thái thành Đã dùng (1) và lưu lại
        ticket.setStatusTk(1);
        ticketRepository.save(ticket);

        return "Check-in soát vé thành công cho vé #" + ticketId;
    }
}