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

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    private String genre;

    @Column(name = "age_rating")
    private String ageRating;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    private String image;

    private String author;
}