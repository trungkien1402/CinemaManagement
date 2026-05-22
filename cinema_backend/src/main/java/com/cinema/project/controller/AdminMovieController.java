package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ĐÃ SỬA: Thêm CORS để tránh lỗi block kết nối từ React (CORS Error)
public class AdminMovieController {

    private final MovieRepository movieRepository;

    // ===================== LẤY TẤT CẢ PHIM =====================
    // ĐÃ SỬA: Thêm "/all" để khớp chính xác với gọi lệnh api.get('/movies/admin/all') từ Frontend Admin
    @GetMapping("/all")
    public ResponseEntity<?> getAllMovies() {
        try {
            List<Movie> movies = movieRepository.findAll();
            return ResponseEntity.ok(movies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lấy danh sách phim: " + e.getMessage());
        }
    }

    // ===================== THỐNG KÊ KHO PHIM =====================
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            List<Movie> movies = movieRepository.findAll();

            // Phân loại đếm số lượng phim theo trạng thái khớp định nghĩa Frontend
            long sapChieu = movies.stream().filter(m -> m.getStatus() == 1).count();
            long dangChieu = movies.stream().filter(m -> m.getStatus() == 2).count();
            long ngungChieu = movies.stream().filter(m -> m.getStatus() == 0).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMovies", movies.size());
            stats.put("upcomingMovies", sapChieu);
            stats.put("nowShowingMovies", dangChieu);
            stats.put("archivedMovies", ngungChieu);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }

    // ===================== THÊM PHIM MỚI =====================
    // Khớp chính xác với api.post('/movies/admin/create', payload)
    @PostMapping("/create")
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        try {
            // Chuẩn hóa dữ liệu đầu vào cơ bản nếu cần
            if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên phim không được để trống!");
            }
            Movie savedMovie = movieRepository.save(movie);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi thêm phim: " + e.getMessage());
        }
    }

    // ===================== SỬA PHIM =====================
    // Khớp chính xác với api.put(`/movies/admin/update/${editingMovieId}`, payload)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestBody Movie movieDetails
    ) {
        try {
            Movie movie = movieRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã phim #" + id + " trên hệ thống!"));

            // Cập nhật toàn bộ thông tin từ Form Frontend gửi xuống
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

            Movie updatedMovie = movieRepository.save(movie);
            return ResponseEntity.ok(updatedMovie);
        } catch (RuntimeException e) {
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
            Movie movie = movieRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mã phim cần xóa!"));

            movieRepository.delete(movie);
            return ResponseEntity.ok("Xóa phim khỏi hệ thống thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Chặn trường hợp phim đã được xếp lịch chiếu (Showtime), không thể xóa trực tiếp vì ràng buộc khóa ngoại
            return ResponseEntity.badRequest().body("Không thể xóa! Bộ phim này hiện đang có suất chiếu hoặc vé đặt tồn tại.");
        }
    }
}