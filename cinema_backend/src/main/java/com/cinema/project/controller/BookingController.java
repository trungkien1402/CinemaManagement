package com.cinema.project.controller;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.service.BookingService;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private SeatRepository seatRepo;

    @Autowired
    private TicketRepository ticketRepo;

    @GetMapping("/showtimes/{showtimeId}/seats")
    public List<Map<String, Object>> getSeatsByShowtime(@PathVariable String showtimeId) {
        return seatRepo.findByShowtimeId(showtimeId);
    }

    @PostMapping("/book")
    public Map<String, String> bookTicket(@RequestBody BookingRequest req) {
        Map<String, String> res = new HashMap<>();
        if (bookingService.bookTicket(req)) {
            res.put("message", "Đặt vé thành công!");
            res.put("status", "success");
        } else {
            res.put("message", "Đặt vé thất bại!");
            res.put("status", "error");
        }
        return res;
    }

    @GetMapping("/user/{userId}/tickets")
    public List<Map<String, Object>> getUserTickets(@PathVariable String userId) {
        return ticketRepo.getTicketsByUser(userId);
    }
}