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

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getReviewsByMovie(@PathVariable Long movieId) {
        List<Review> movieReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getMovie() != null && r.getMovie().getMovieId().equals(movieId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(movieReviews);
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        review.setCreatedAt(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }

    // 3. Xóa bình luận theo reviewId
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.ok("Xóa bình luận thành công!");
    }
}