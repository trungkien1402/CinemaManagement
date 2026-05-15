package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieService movieService;

    // --- CLIENT API ---
    @GetMapping
    public ResponseEntity<MovieResponse> getAllMovies(@RequestParam(required = false) Integer status) {
        List<Movie> list = (status != null) ? movieService.getMoviesByStatus(status) : movieService.getAllMovies();
        return ResponseEntity.ok(new MovieResponse(true, list));
    }

    // --- ADMIN API ---
    @GetMapping("/admin/all")
    public ResponseEntity<List<Movie>> adminGetAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getMovieStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMovies", movieService.getAllMovies().size());
        stats.put("activeMovies", movieService.getMoviesByStatus(1).size());
        stats.put("success", true);
        return ResponseEntity.ok(stats);
    }
}