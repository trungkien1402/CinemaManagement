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
    @Column(
       name = "movie_id"
    )
    private Long movieId;

    @Column(
       name = "title",
       nullable = false
    )
    private String title;

    @Column(
       name = "description",
       columnDefinition = "TEXT"
    )
    private String description;

    @Column(
       name = "trailer_url"
    )
    private String trailerUrl;

    @Column(
        name = "movie_format",
        length = 50
    )
    private String movieFormat;

    @Column(
        name = "status",
        nullable = false
    )
    private int status = 1;

    @Column(
        name = "duration",
        nullable= false
    )
    private int duration;

    @Column(
        name = "genre",
        nullable = false,
        length = 100
    )
    private String genre;

    @Column(
        name = "age_rating",
        length = 10
    )
    private String ageRating;

    @Column(
        name = "release_date",
        nullable = false
    )
    private LocalDate releaseDate;

    @Column(
        name = "image"
    )
    private String image;

    @Column(
        name = "author"
    )
    private String author;
}