package com.cinema.project.service;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.*;
import com.cinema.project.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public List<Ticket> processBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Suất chiếu"));

        List<Ticket> savedTickets = new ArrayList<>();

        // 1. Lấy danh sách các ghế ĐÃ BÁN của riêng suất chiếu này để kiểm tra
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(request.getShowtimeId());

        for (String seatId : request.getSeatIds()) {

            // 2. Chặn ngay nếu phát hiện ghế đã có người đặt trong suất chiếu này
            if (bookedSeatIds.contains(seatId)) {
                throw new RuntimeException("Rất tiếc, một trong các ghế bạn chọn đã có người đặt!");
            }

            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Ghế"));

            // KHÔNG CÒN GỌI seat.setIsOccupied() Ở ĐÂY NỮA

            // 3. Backend tự tính giá an toàn dựa trên loại ghế
            double ticketPrice = 30000; // Mặc định ghế THUONG
            if ("VIP".equalsIgnoreCase(seat.getSeatType())) {
                ticketPrice = 50000;
            } else if ("DOI".equalsIgnoreCase(seat.getSeatType())) {
                ticketPrice = 100000;
            }

            // 4. Tạo vé mới
            Ticket ticket = new Ticket();
            String randomTicketId = "TK-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

            ticket.setTicketId(randomTicketId);
            ticket.setUser(user);
            ticket.setShowtime(showtime);
            ticket.setSeat(seat);
            ticket.setTotalPrice(ticketPrice); // Giá thực tế của từng vé
            ticket.setStatus("SUCCESS");
            ticket.setBookingDate(LocalDateTime.now());

            savedTickets.add(ticketRepository.save(ticket));
        }

        return savedTickets;
    }
}