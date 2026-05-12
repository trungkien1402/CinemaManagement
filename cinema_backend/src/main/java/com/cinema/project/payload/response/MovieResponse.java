package com.cinema.project.payload.response;

import com.cinema.project.model.Movie;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor

public class MovieResponse {
    private boolean success;
    private List<Movie> listMovies;
}
