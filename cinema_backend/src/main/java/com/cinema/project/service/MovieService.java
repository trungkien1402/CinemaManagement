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

    // Sửa tham số truyền vào thành int để khớp với Repository và Entity
    public List<Movie> getMoviesByStatus(int status) {
        // Vì status là kiểu int (primitive), nó không thể null.
        // Bạn có thể kiểm tra logic nếu cần (ví dụ: status >= 0)
        return movieRepository.findByStatus(status);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }
}