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
@RequestMapping("/api/movies/admin")
@RequiredArgsConstructor
public class AdminMovieController {

    private final MovieRepository movieRepository;

    // ===================== LẤY TẤT CẢ PHIM =====================

    @GetMapping("/all")
    public ResponseEntity<?> getAllMovies() {

        List<Movie> movies = movieRepository.findAll();

        return ResponseEntity.ok(movies);
    }

    // ===================== THỐNG KÊ =====================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {

        List<Movie> movies = movieRepository.findAll();

        long activeMovies = movies.stream()
                .filter(m -> m.getStatus() == 1)
                .count();

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalMovies", movies.size());
        stats.put("activeMovies", activeMovies);

        return ResponseEntity.ok(stats);
    }

    // ===================== THÊM PHIM =====================

    @PostMapping("/create")
    public ResponseEntity<?> createMovie(
            @RequestBody Movie movie
    ) {

        Movie savedMovie =
                movieRepository.save(movie);

        return ResponseEntity.ok(savedMovie);
    }

    // ===================== SỬA PHIM =====================

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestBody Movie movieDetails
    ) {

        Movie movie = movieRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phim!")
                );

        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setTrailerUrl(movieDetails.getTrailerUrl());
        movie.setMovieFormat(movieDetails.getMovieFormat());
        movie.setStatus(movieDetails.getStatus());
        movie.setDuration(movieDetails.getDuration());
        movie.setGenre(movieDetails.getGenre());
        movie.setAgeRating(movieDetails.getAgeRating());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setImage(movieDetails.getImage());
        movie.setAuthor(movieDetails.getAuthor());

        Movie updatedMovie =
                movieRepository.save(movie);

        return ResponseEntity.ok(updatedMovie);
    }

    // ===================== XÓA PHIM =====================

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMovie(
            @PathVariable Long id
    ) {

        Movie movie = movieRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phim!")
                );

        movieRepository.delete(movie);

        return ResponseEntity.ok(
                "Xóa phim thành công!"
        );
    }
}