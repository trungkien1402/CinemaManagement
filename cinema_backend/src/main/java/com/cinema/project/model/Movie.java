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

    // dung nvarchar(255) de ho tro tieng Viet
    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    // dung nvarchar(max) de luu mo ta dai
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
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
    // dung nvarchar(100) de ho tro tieng Viet
    @Column(name = "genre", nullable = false, columnDefinition = "NVARCHAR(100)")
    private String genre;

    @Column(name = "age_rating", length = 10)
    private String ageRating;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    // dung nvarchar(255) de ho tro tieng Viet
    @Column(name = "author", columnDefinition = "NVARCHAR(255)")
    private String author;
}