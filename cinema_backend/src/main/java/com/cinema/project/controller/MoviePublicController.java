package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MoviePublicController {

    private final MovieService movieService;

    // API: http://localhost:8080/api/public/movies/search?keyword=...
    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(@RequestParam String keyword) {
        return ResponseEntity.ok(movieService.searchMoviesByTitle(keyword));
    }
}