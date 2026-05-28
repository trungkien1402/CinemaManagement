package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // ĐÃ ĐỔI: Sử dụng Lombok để tự động tạo Constructor injection cho Repository
public class MovieService {

    private final MovieRepository movieRepository;

    // 1. Lấy phim theo status (1: Sắp chiếu, 2: Đang chiếu)
    public List<Movie> getMoviesByStatus(int status) {
        return movieRepository.findByStatus(status);
    }

    // 2. Lấy toàn bộ phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // 3. Lấy chi tiết phim theo id
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    public List<Movie> searchMoviesByTitle(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return movieRepository.findByTitleContainingIgnoreCase(keyword.trim());
    }
}