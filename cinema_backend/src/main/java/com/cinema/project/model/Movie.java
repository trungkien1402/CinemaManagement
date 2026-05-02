package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Data
public class Movie {
    @Id
    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "status", nullable = false)
    private int status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration", nullable = false)
    private int duration;

    @Column(name = "genre", nullable = false)
    private String genre;

    @Column(name = "age_rating")
    private String ageRating;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "image")
    private String image;

    @Column(name = "author")
    private String author;
}