package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;

    // =========================================================================
    // CLIENT API - LẤY DANH SÁCH PHIM RA TRANG CHỦ (Đang chiếu / Sắp chiếu)
    // =========================================================================
    @GetMapping
    public ResponseEntity<?> getAllMovies(
            @RequestParam(required = false) Integer status
    ) {
        try {
            List<Movie> list = (status != null)
                    ? movieService.getMoviesByStatus(status)
                    : movieService.getAllMovies();

            return ResponseEntity.ok(new MovieResponse(true, list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải danh sách phim: " + e.getMessage());
        }
    }

    // =========================================================================
    // CLIENT API - XEM CHI TIẾT BỘ PHIM
    // =========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Integer id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Mã định danh phim không hợp lệ!");
            }

            Long idInLongFormat = id.longValue();

            return movieService.getMovieById(idInLongFormat)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi tải chi tiết phim: " + e.getMessage());
        }
    }
}