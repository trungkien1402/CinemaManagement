package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepo;

    @Autowired
    private ShowtimeRepository showtimeRepo;

    public List<Movie> getShowingMovies() {
        return movieRepo.findByStatus(1);
    }

    public Movie getMovieById(String id) {
        return movieRepo.findById(id);
    }

    public List<Map<String, Object>> getShowtimes(String movieId) {
        return showtimeRepo.findByMovieId(movieId);
    }
}