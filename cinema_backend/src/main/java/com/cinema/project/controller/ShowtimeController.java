package com.cinema.project.controller;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.payload.response.SeatResponse;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/showtimes")

public class ShowtimeController {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;


    @GetMapping("/filter")
    public ResponseEntity<?> getShowtimesByFilter(
            @RequestParam String theaterId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<Showtime> allShowtimes = showtimeRepository.findAll();
            List<Showtime> filteredList;

            if ("all".equalsIgnoreCase(theaterId)) {
                
                filteredList = allShowtimes.stream()
                        .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date))
                        .collect(Collectors.toList());
            } else {

                filteredList = allShowtimes.stream()
                        .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date)
                                && st.getRoom() != null && st.getRoom().getTheater() != null
                                && theaterId.equalsIgnoreCase(st.getRoom().getTheater().getTheaterId()))
                        .collect(Collectors.toList());
            }
            return ResponseEntity.ok(filteredList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải lịch chiếu động: " + e.getMessage());
        }
    }

    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsForShowtime(@PathVariable String showtimeId) {

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu"));


        List<Seat> allSeats = seatRepository.findByRoom_RoomId(showtime.getRoom().getRoomId());


        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);


        List<SeatResponse> response = allSeats.stream().map(seat -> {
            boolean isOccupied = bookedSeatIds.contains(seat.getSeatId());
            return new SeatResponse(
                    seat.getSeatId(),
                    seat.getSeatNumber(),
                    seat.getSeatType(),
                    isOccupied
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
