package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getMoviesByStatus(int status) {
        return movieRepository.findByStatus(status);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
}