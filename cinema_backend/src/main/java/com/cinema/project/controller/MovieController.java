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

    // CLIENT API
    @GetMapping
    public ResponseEntity<MovieResponse> getAllMovies(
            @RequestParam(required = false) Integer status
    ) {

        List<Movie> list = (status != null)
                ? movieService.getMoviesByStatus(status)
                : movieService.getAllMovies();

        return ResponseEntity.ok(new MovieResponse(true, list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {

        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}