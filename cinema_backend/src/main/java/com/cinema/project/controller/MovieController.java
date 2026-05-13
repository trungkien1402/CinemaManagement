package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping
    public ResponseEntity<MovieResponse> getAllMovies(@RequestParam(required = false) Integer status) {
        List<Movie> list;

        if (status != null) {
            list = movieService.getMoviesByStatus(status);
        } else {

            list = movieService.getAllMovies();
        }

        MovieResponse response = new MovieResponse(true, list);
        return ResponseEntity.ok(response);
    }
}