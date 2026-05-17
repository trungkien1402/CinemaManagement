package com.cinema.project.controller;

import com.cinema.project.model.Theater;
import com.cinema.project.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class TheaterController {

    private final TheaterRepository theaterRepository;

    @GetMapping
    public ResponseEntity<?> getAllTheaters() {
        try {
            List<Theater> theaters = theaterRepository.findAll();
            return ResponseEntity.ok(theaters);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách rạp: " + e.getMessage());
        }
    }
}
