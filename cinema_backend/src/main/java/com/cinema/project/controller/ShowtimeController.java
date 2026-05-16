package com.cinema.project.controller;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.payload.response.SeatResponse;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*", maxAge = 3600) // Bắt buộc để React ở port 3000 gọi không bị lỗi CORS
public class ShowtimeController {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsForShowtime(@PathVariable String showtimeId) {
        // 1. Tìm suất chiếu để biết phim chiếu ở phòng nào
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu"));

        // 2. Lấy toàn bộ 50 ghế vật lý của phòng đó
        List<Seat> allSeats = seatRepository.findByRoom_RoomId(showtime.getRoom().getRoomId());

        // 3. Lấy danh sách ID các ghế đã bị mua TRONG ĐÚNG SUẤT CHIẾU NÀY
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        // 4. Lắp ráp lại trả về cho React (Kiểm tra xem seatId có nằm trong danh sách bị mua chưa)
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