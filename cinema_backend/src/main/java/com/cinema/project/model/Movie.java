package com.cinema.project.model;

import jakarta.persistence.*;
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

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Column(name = "movie_format", length = 50)
    private String movieFormat;

    private Integer status;
    private Integer duration;

    @Column(length = 100)
    private String genre;

    @Column(name = "age_rating", length = 10)
    private String ageRating;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(length = 500)
    private String image;

    @Column(length = 100)
    private String author;
}