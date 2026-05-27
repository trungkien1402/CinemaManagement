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
    // 💡 Đã sửa: Ép kiểu NVARCHAR(255) cho tên phim
    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    // 💡 Đã sửa: Ép kiểu NVARCHAR(MAX) thay cho TEXT cũ
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "trailer_url", columnDefinition = "TEXT")
    private String trailerUrl;

    // 💡 Đã sửa: Định dạng phim (2D Lồng tiếng...) cũng cần tiếng Việt
    @Column(name = "movie_format", columnDefinition = "NVARCHAR(50)")
    private String movieFormat;

    @Column(name = "status", nullable = false)
    private int status;

    @Min(value = 1, message = "Thời lượng phải lớn hơn 0")
    @Column(name = "duration", nullable = false)
    private int duration;

    @NotBlank(message = "Thể loại không được để trống")
    // 💡 Đã sửa: Ép kiểu NVARCHAR(100) cho thể loại
    @Column(name = "genre", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String genre;

    @Column(name = "age_rating", length = 10)
    private String ageRating;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    // 💡 Đã sửa: Ép kiểu NVARCHAR(255) cho tên tác giả/đạo diễn
    @Column(name = "author", columnDefinition = "NVARCHAR(255)")
    private String author;
}