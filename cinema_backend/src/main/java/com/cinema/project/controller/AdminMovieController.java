package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.service.AdminMovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminMovieController {


    private final AdminMovieService adminMovieService;

    // lay phim
    @GetMapping("/all")
    public ResponseEntity<?> getAllMovies() {
        try {
            List<Movie> movies = adminMovieService.getAllMovies();
            return ResponseEntity.ok(movies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy danh sách phim: " + e.getMessage());
        }
    }

    // thong ke kho phim
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = adminMovieService.getMovieStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy thống kê: " + e.getMessage());
        }
    }

    // them phim moi
    @PostMapping("/create")
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        try {
            Movie savedMovie = adminMovieService.createMovie(movie);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi thêm phim: " + e.getMessage());
        }


    }

    // sua phim
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestBody Movie movieDetails
    ) {
        try {
            Movie updatedMovie = adminMovieService.updateMovie(id, movieDetails);
            return ResponseEntity.ok(updatedMovie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi cập nhật dữ liệu phim: " + e.getMessage());
        }
    }

    // ===================== XÓA PHIM =====================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            adminMovieService.deleteMovie(id);
            return ResponseEntity.ok("Xóa phim khỏi hệ thống thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Trường hợp phim dính khóa ngoại (đã có lịch chiếu/vé đặt) sẽ rơi vào đây
            return ResponseEntity.badRequest()
                    .body("Không thể xóa! Bộ phim này hiện đang có suất chiếu hoặc vé đặt tồn tại.");
        }
    }
}