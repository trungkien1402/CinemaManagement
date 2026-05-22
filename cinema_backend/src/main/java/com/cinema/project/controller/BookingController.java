package com.cinema.project.controller;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.Ticket;
import com.cinema.project.repositories.TicketRepository;
import com.cinema.project.service.BookingService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor

public class BookingController {

    private final BookingService bookingService;
    private final TicketRepository ticketRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request
    ) {

        try {

            List<Ticket> result =
                    bookingService.processBooking(request);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // API lấy ghế đã đặt
    @GetMapping("/booked-seats/{showtimeId}")
    public ResponseEntity<?> getBookedSeats(
            @PathVariable String showtimeId
    ) {

        return ResponseEntity.ok(
                ticketRepository.findBookedSeatIdsByShowtime(
                        showtimeId
                )
        );
    }
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getBookingHistory(@PathVariable Long userId) {
        try {
            // 1. Lấy danh sách vé từ database dựa vào userId (kiểu Long)
            List<Ticket> tickets = ticketRepository.findByUserId(userId);

            // 2. SỬA TẠI ĐÂY: Trả về biến 'tickets' thay vì 'history'
            return ResponseEntity.ok(tickets);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy lịch sử đặt vé: " + e.getMessage());
        }
    }
}