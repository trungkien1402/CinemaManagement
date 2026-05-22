package com.cinema.project.controller;

import com.cinema.project.model.Review;
import com.cinema.project.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    // 1. Lấy danh sách bình luận của 1 phim
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Review>> getReviewsByMovie(@PathVariable Integer movieId) {
        List<Review> reviews = reviewRepository.findByMovie_MovieIdOrderByCreatedAtDesc(movieId);
        return ResponseEntity.ok(reviews);
    }

    // 2. Lưu bình luận mới từ React gửi xuống
    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        try {
            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.ok(savedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi thêm bình luận: " + e.getMessage());
        }
    }
}