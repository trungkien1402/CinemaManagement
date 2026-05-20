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

        // tìm user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy User"));

        // tìm suất chiếu
        Showtime showtime =
                showtimeRepository.findById(request.getShowtimeId())
                        .orElseThrow(() ->
                                new RuntimeException("Không tìm thấy Suất chiếu"));

        List<Ticket> savedTickets = new ArrayList<>();

        // duyệt từng ghế
        for (String seatId : request.getSeatIds()) {

            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() ->
                            new RuntimeException("Không tìm thấy Ghế"));

            // kiểm tra ghế đã được đặt chưa
            boolean exists =
                    ticketRepository.existsByShowtimeAndSeat(
                            showtime,
                            seat
                    );

            if (exists) {
                throw new RuntimeException(
                        "Ghế " + seat.getSeatNumber()
                                + " đã được đặt!"
                );
            }

            // tính giá ghế
            double ticketPrice = calculateSeatPrice(seat);

            // tạo ticket
            Ticket ticket = new Ticket();

            String randomTicketId =
                    "TK-" +
                            UUID.randomUUID()
                                    .toString()
                                    .substring(0, 8)
                                    .toUpperCase();

            ticket.setTicketId(randomTicketId);

            ticket.setUser(user);

            ticket.setShowtime(showtime);

            ticket.setSeat(seat);

            ticket.setTotalPrice(ticketPrice);

            ticket.setStatus("BOOKED");

            ticket.setBookingDate(LocalDateTime.now());

            savedTickets.add(
                    ticketRepository.save(ticket)
            );
        }

        return savedTickets;
    }

    // tính giá theo loại ghế
    private double calculateSeatPrice(Seat seat) {

        if (seat.getSeatType() == null) {
            return 30000;
        }

        switch (seat.getSeatType().toUpperCase()) {

            case "VIP":
                return 50000;

            case "DOI":
                return 100000;

            default:
                return 30000;
        }
    }
}