package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.payload.response.MovieResponse;
import com.cinema.project.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ĐÃ SỬA: Bổ sung CORS đảm bảo Client ReactJS gọi API không bị chặn
public class MovieController {

    private final MovieService movieService;

    // =========================================================================
    // CLIENT API - LẤY DANH SÁCH PHIM RA TRANG CHỦ (Đang chiếu / Sắp chiếu)
    // =========================================================================
    // URL: GET http://localhost:8080/api/movies?status=2 (2: Đang chiếu, 1: Sắp chiếu)
    @GetMapping
    public ResponseEntity<?> getAllMovies(
            @RequestParam(required = false) Integer status
    ) {
        try {
            List<Movie> list = (status != null)
                    ? movieService.getMoviesByStatus(status)
                    : movieService.getAllMovies();

            // Trả về cấu trúc bọc dữ liệu chuẩn MovieResponse(success=true, listMovies=[...])
            return ResponseEntity.ok(new MovieResponse(true, list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể tải danh sách phim: " + e.getMessage());
        }
    }

    // =========================================================================
    // CLIENT API - XEM CHI TIẾT BỘ PHIM (Dùng khi click vào ảnh phim ở giao diện Client)
    // =========================================================================
    // URL: GET http://localhost:8080/api/movies/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Integer id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Mã định danh phim không hợp lệ!");
            }

            // Chuyển đổi an toàn kiểu dữ liệu từ Integer sang Long trước khi đẩy xuống tầng Service xử lý database
            Long idInLongFormat = id.longValue();

            return movieService.getMovieById(idInLongFormat)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi tải chi tiết phim: " + e.getMessage());
        }
    }

    // 💡 ĐÃ LOẠI BỎ: Hàm getAllMoviesForAdmin() từng trùng lặp URL tại đây.
    // Toàn bộ luồng dữ liệu Admin sẽ được điều phối độc lập qua file AdminMovieController.java giúp code sạch và dễ bảo trì.
}