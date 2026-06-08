package com.cinema.project.controller;

import com.cinema.project.model.MovieFavorite;
import com.cinema.project.repositories.MovieFavoriteRepository;
import com.cinema.project.repositories.MovieRepository;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovieFavoriteController {

    private final MovieFavoriteRepository movieFavoriteRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @GetMapping("/check")
    public ResponseEntity<?> checkFavorite(@RequestParam Long userId, @RequestParam Long movieId) {
        boolean isFav = movieFavoriteRepository.existsByUser_UserIdAndMovie_MovieId(userId, movieId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorite(@RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        Long movieId = payload.get("movieId");

        if (userId == null || movieId == null) {
            return ResponseEntity.badRequest().body("Thiếu userId hoặc movieId");
        }

        return movieFavoriteRepository.findByUser_UserIdAndMovie_MovieId(userId, movieId)
            .map(fav -> {
                movieFavoriteRepository.delete(fav);
                return ResponseEntity.ok(Map.of("isFavorite", false, "message", "Đã xóa khỏi danh sách yêu thích"));
            })
            .orElseGet(() -> {
                MovieFavorite fav = new MovieFavorite();
                fav.setUser(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")));
                fav.setMovie(movieRepository.findById(movieId).orElseThrow(() -> new RuntimeException("Movie not found")));
                movieFavoriteRepository.save(fav);
                return ResponseEntity.ok(Map.of("isFavorite", true, "message", "Đã thêm vào danh sách yêu thích"));
            });
    }
}
