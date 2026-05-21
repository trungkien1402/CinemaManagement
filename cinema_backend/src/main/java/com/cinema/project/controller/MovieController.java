package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;

    // CLIENT API - Lấy danh sách phim (Đang chiếu / Sắp chiếu hoặc Tất cả)
    @GetMapping
    public ResponseEntity<MovieResponse> getAllMovies(
            @RequestParam(required = false) Integer status
    ) {

        List<Movie> list = (status != null)
                ? movieService.getMoviesByStatus(status)
                : movieService.getAllMovies();

        return ResponseEntity.ok(new MovieResponse(true, list));
    }

    // CLIENT API - Lấy chi tiết 1 bộ phim theo mã ID truyền từ Frontend
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Integer id) {

        // 💡 GIẢI PHÁP: Chuyển đổi an toàn từ Integer sang Long trước khi truyền vào tầng Service
        Long idInLongFormat = id.longValue();

        return movieService.getMovieById(idInLongFormat)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}