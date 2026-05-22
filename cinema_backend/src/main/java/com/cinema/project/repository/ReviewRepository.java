package com.cinema.project.repository;

import com.cinema.project.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // Tìm toàn bộ bình luận của 1 bộ phim, sắp xếp mới nhất lên đầu
    List<Review> findByMovie_MovieIdOrderByCreatedAtDesc(Integer movieId);
}