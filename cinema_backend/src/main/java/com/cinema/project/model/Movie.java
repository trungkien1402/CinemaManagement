package com.cinema.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long movieId;

    @NotBlank(message = "Tên phim không được để trống")
    // SỬA: Ép kiểu dữ liệu sang utf8mb4 để nhận tiếng Việt có dấu
    @Column(name = "title", nullable = false, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String title;

    // SỬA: Ép kiểu dữ liệu sang utf8mb4 cho phần mô tả dài
    @Column(name = "description", columnDefinition = "LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String description;

    @Column(name = "trailer_url", columnDefinition = "TEXT")
    private String trailerUrl;

    @Column(name = "movie_format", length = 50)
    private String movieFormat;

    @Column(name = "status", nullable = false)
    private int status ;

    @Min(value = 1, message = "Thời lượng phải lớn hơn 0")
    @Column(name = "duration", nullable = false)
    private int duration;

    @NotBlank(message = "Thể loại không được để trống")
    // SỬA: Đảm bảo thể loại phim (Hành động, Hài hước...) không lỗi font
    @Column(name = "genre", nullable = false, columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String genre;

    @Column(name = "age_rating", length = 10)
    private String ageRating;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    // SỬA: Hỗ trợ tên tác giả/đạo diễn bằng tiếng Việt có dấu
    @Column(name = "author", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String author;
}