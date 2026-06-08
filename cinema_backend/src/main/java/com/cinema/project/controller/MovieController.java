package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;

    // =========================================================================
    // CLIENT API - LẤY DANH SÁCH PHIM RA TRANG CHỦ (Đang chiếu / Sắp chiếu)
    // =========================================================================
    @GetMapping
    public ResponseEntity<?> getAllMovies(
            @RequestParam(required = false) Integer status
    ) {
        try {
            List<Movie> list = (status != null)
                    ? movieService.getMoviesByStatus(status)
                    : movieService.getAllMovies();

            return ResponseEntity.ok(new MovieResponse(true, list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải danh sách phim: " + e.getMessage());
        }
    }

    // =========================================================================
    // CLIENT API - XEM CHI TIẾT BỘ PHIM
    // =========================================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Integer id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Mã định danh phim không hợp lệ!");
            }

            Long idInLongFormat = id.longValue();

            return movieService.getMovieById(idInLongFormat)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi tải chi tiết phim: " + e.getMessage());
        }
    }

    // =========================================================================
    // api admin thêm phim (có nhận file ảnh và video + đã fix lỗi ngày)
    // =========================================================================
    @PostMapping("/admin/create")
    public ResponseEntity<?> createMovieWithFiles(
            @RequestParam("title") String title,
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
            Movie movie = new Movie();
            movie.setTitle(title);
            movie.setGenre(genre);
            movie.setDuration(duration);
            movie.setAuthor(author);
            movie.setMovieFormat(movieFormat);
            movie.setAgeRating(ageRating);
            movie.setStatus(status != null ? status : 1);
            movie.setDescription(description);

            // Xử lý ngày phát hành
            if (releaseDate != null && !releaseDate.trim().isEmpty()) {
                movie.setReleaseDate(LocalDate.parse(releaseDate));
            }

            // 1. Xử lý Ảnh Poster
            if (imageFile != null && !imageFile.isEmpty()) {
                String posterPath = movieService.saveFile(imageFile, "posters");
                movie.setImage("http://localhost:8080" + posterPath);
            } else {
                movie.setImage("https://placehold.co/400x600?text=No+Poster");
            }

            // 2. Xử lý Trailer
            if (trailerFile != null && !trailerFile.isEmpty()) {
                String trailerPath = movieService.saveFile(trailerFile, "trailers");
                movie.setTrailerUrl("http://localhost:8080" + trailerPath);
            } else {
                movie.setTrailerUrl("");
            }

            Movie savedMovie = movieService.saveMovieObj(movie);
            return ResponseEntity.ok(savedMovie);

        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để debug nếu có
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi thêm phim mới: " + e.getMessage());
        }
    }
}