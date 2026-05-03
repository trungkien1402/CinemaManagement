package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {
    @Autowired
    private MovieService movieService;

    @GetMapping("/showing")
    public List<Movie> getShowingMovies() {
        return movieService.getShowingMovies();
    }

    @GetMapping("/{id}")
    public Movie getMovieDetail(@PathVariable String id) {
        return movieService.getMovieById(id);
    }

    @GetMapping("/{id}/showtimes")
    public List<Map<String, Object>> getMovieShowtimes(@PathVariable String id) {
        return movieService.getShowtimes(id);
    }
}