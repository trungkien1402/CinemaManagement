package com.cinema.project.controller;

import com.cinema.project.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeatController {

    private final SeatService seatService;

   
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getSeatsByRoom(@PathVariable String roomId) {
        try {
            return ResponseEntity.ok(seatService.getSeatsByRoom(roomId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách ghế: " + e.getMessage());
        }
    }


    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<?> getSeatsByShowtime(@PathVariable String showtimeId) {
        try {
            return ResponseEntity.ok(seatService.getSeatsStatusByShowtime(showtimeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy trạng thái ghế theo suất chiếu: " + e.getMessage());
        }
    }
}
