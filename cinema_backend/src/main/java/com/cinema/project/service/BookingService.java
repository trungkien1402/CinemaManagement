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


        for (String seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Ghế"));


            if (seat.getIsOccupied() != null && seat.getIsOccupied()) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã có người đặt!");
            }

            seat.setIsOccupied(true);
            seatRepository.save(seat);

            Ticket ticket = new Ticket();

            String randomTicketId = "TK-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

            ticket.setTicketId(randomTicketId);
            ticket.setUser(user);
            ticket.setShowtime(showtime);
            ticket.setSeat(seat);
            ticket.setTotalPrice(request.getPricePerSeat());
            ticket.setStatus("SUCCESS");
            ticket.setBookingDate(LocalDateTime.now());

            savedTickets.add(ticketRepository.save(ticket));
        }

        return savedTickets;
    }
}