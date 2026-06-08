package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.service.AdminMovieService;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminMovieController {

    private final AdminMovieService adminMovieService;
    private final MovieService movieService; // Gọi service để dùng chung hàm lưu file

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

    // =========================================================================================
    // hàm cập nhật phim (update) nay đã hỗ trợ upload file và lưu ngày tháng chuẩn xác
    // =========================================================================================
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "duration", required = false) Integer duration,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "movieFormat", required = false) String movieFormat,
            @RequestParam(value = "ageRating", required = false) String ageRating,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "releaseDate", required = false) String releaseDate,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "trailerFile", required = false) MultipartFile trailerFile
    ) {
        try {
            // Khởi tạo 1 đối tượng Movie tạm để hứng dữ liệu chỉnh sửa
            Movie movieDetails = new Movie();
            if (title != null) movieDetails.setTitle(title);
            if (genre != null) movieDetails.setGenre(genre);
            if (duration != null) movieDetails.setDuration(duration);
            if (author != null) movieDetails.setAuthor(author);
            if (movieFormat != null) movieDetails.setMovieFormat(movieFormat);
            if (ageRating != null) movieDetails.setAgeRating(ageRating);
            if (status != null) movieDetails.setStatus(status);
            if (description != null) movieDetails.setDescription(description);

            // bổ sung lưu ngày phát hành
            if (releaseDate != null && !releaseDate.isEmpty()) {
                movieDetails.setReleaseDate(LocalDate.parse(releaseDate));
            }

            // Xử lý nếu Admin có chọn upload File Ảnh mới (Nếu không chọn, giữ nguyên ảnh cũ)
            if (imageFile != null && !imageFile.isEmpty()) {
                String posterPath = movieService.saveFile(imageFile, "posters");
                movieDetails.setImage("http://localhost:8080" + posterPath);
            }

            // Xử lý nếu Admin có chọn upload File Video Trailer mới
            if (trailerFile != null && !trailerFile.isEmpty()) {
                String trailerPath = movieService.saveFile(trailerFile, "trailers");
                movieDetails.setTrailerUrl("http://localhost:8080" + trailerPath);
            }

            // Gọi service xử lý update
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