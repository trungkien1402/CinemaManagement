package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminMovieController {

    private final MovieRepository movieRepository;


    @GetMapping("/all")
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieRepository.findAll());
    }


    @PostMapping("/add")
    public ResponseEntity<?> addMovie(@RequestBody Movie movie) {
        if (movieRepository.existsById(movie.getMovieId())) {
            return ResponseEntity.badRequest().body("Mã phim đã tồn tại!");
        }
        return ResponseEntity.ok(movieRepository.save(movie));
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(movieDetails.getTitle());
            movie.setDescription(movieDetails.getDescription());
            movie.setGenre(movieDetails.getGenre());
            movie.setDuration(movieDetails.getDuration());
            movie.setReleaseDate(movieDetails.getReleaseDate());
            movie.setImage(movieDetails.getImage());
            movie.setAuthor(movieDetails.getAuthor());
            movie.setTrailerUrl(movieDetails.getTrailerUrl());
            movie.setMovieFormat(movieDetails.getMovieFormat());
            movie.setAgeRating(movieDetails.getAgeRating());
            movie.setStatus(movieDetails.getStatus());

            movieRepository.save(movie);
            return ResponseEntity.ok("Cập nhật phim thành công!");
        }).orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        movieRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa phim thành công!");
    }


    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalMovies = movieRepository.count();

        long activeMovies = movieRepository.findByStatus(1).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMovies", totalMovies);
        stats.put("activeMovies", activeMovies);

        return ResponseEntity.ok(stats);
    }
}