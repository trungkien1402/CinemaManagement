package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    // Lấy phim theo status
    public List<Movie> getMoviesByStatus(int status) {
        return movieRepository.findByStatus(status);
    }

    // Lấy toàn bộ phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Lấy phim theo id
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }
}