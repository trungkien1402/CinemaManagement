package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    // Nối với bảng Phim
    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    // Nối với bảng User (Người dùng)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "rating")
    private int rating;

    @Column(name = "comment", columnDefinition = "NVARCHAR(1000)")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}