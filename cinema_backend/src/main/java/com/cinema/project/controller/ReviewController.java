package com.cinema.project.controller;


import com.cinema.project.model.Review;
import com.cinema.project.repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // 1. Kéo bình luận từ SQL Server lên React
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getReviewsByMovie(@PathVariable Long movieId) {
        // Lấy tất cả và lọc ra đúng bình luận của phim đang xem
        List<Review> movieReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getMovie() != null && r.getMovie().getMovieId().equals(movieId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(movieReviews);
    }

    // 2. Nhận bình luận từ React và lưu thẳng vào SQL Server
    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        // Tự động đóng dấu thời gian lúc gửi bình luận
        review.setCreatedAt(LocalDateTime.now());

        // Lưu vào DB
        Review savedReview = reviewRepository.save(review);

        return ResponseEntity.ok(savedReview);
    }
}