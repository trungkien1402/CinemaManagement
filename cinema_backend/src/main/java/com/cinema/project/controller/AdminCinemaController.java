package com.cinema.project.controller;

import com.cinema.project.payload.request.RoomCreationRequest;
import com.cinema.project.model.Room;
import com.cinema.project.model.Seat;
import com.cinema.project.model.Theater;
import com.cinema.project.service.AdminCinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminCinemaController {

    private final AdminCinemaService adminCinemaService;

    @PostMapping("/theaters/create")
    public ResponseEntity<?> createTheater(@RequestBody Theater theater) {
        try {
            Theater created = adminCinemaService.createTheater(theater);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi thêm rạp: " + e.getMessage());
        }
    }

    @GetMapping("/theaters/all")
    public ResponseEntity<?> getAllTheaters() {
        try {
            List<Theater> theaters = adminCinemaService.getAllTheaters();
            return ResponseEntity.ok(theaters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/rooms/create/{theaterId}")
    public ResponseEntity<?> createRoomAndSeats(
            @PathVariable String theaterId,
            @RequestBody RoomCreationRequest dto
    ) {
        try {
            String message = adminCinemaService.createRoomAndSeats(theaterId, dto);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @GetMapping("/rooms/theater/{theaterId}")
    public ResponseEntity<List<Room>> getRoomsByTheater(@PathVariable String theaterId) {
        return ResponseEntity.ok(adminCinemaService.getRoomsByTheater(theaterId));
    }

    @GetMapping("/seats/room/{roomId}")
    public ResponseEntity<List<Seat>> getSeatsByRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(adminCinemaService.getSeatsByRoom(roomId));
    }

    @PutMapping("/seats/change-type/{seatId}")
    public ResponseEntity<?> changeSeatType(@PathVariable String seatId) {
        try {
            Seat updatedSeat = adminCinemaService.changeSeatType(seatId);
            return ResponseEntity.ok(updatedSeat);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi đổi loại ghế: " + e.getMessage());
        }
    }
}