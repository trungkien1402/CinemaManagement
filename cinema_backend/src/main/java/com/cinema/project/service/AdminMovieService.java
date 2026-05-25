package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminMovieService {

    private final MovieRepository movieRepository;

    // 1. Lấy tất cả phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // 2. Thống kê kho phim
    public Map<String, Object> getMovieStats() {
        List<Movie> movies = movieRepository.findAll();

        // Lọc stream tính toán theo trạng thái (0: Ngưng chiếu, 1: Sắp chiếu, 2: Đang chiếu)
        long sapChieu = movies.stream().filter(m -> m.getStatus() == 1).count();
        long dangChieu = movies.stream().filter(m -> m.getStatus() == 2).count();
        long ngungChieu = movies.stream().filter(m -> m.getStatus() == 0).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMovies", movies.size());
        stats.put("upcomingMovies", sapChieu);
        stats.put("nowShowingMovies", dangChieu);
        stats.put("archivedMovies", ngungChieu);

        return stats;
    }

    // 3. Thêm phim mới
    @Transactional
    public Movie createMovie(Movie movie) {
        if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên phim không được để trống!");
        }
        return movieRepository.save(movie);
    }

    // 4. Cập nhật thông tin phim
    @Transactional
    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã phim #" + id + " trên hệ thống!"));

        // Đồng bộ dữ liệu mới từ Form Frontend
        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setTrailerUrl(movieDetails.getTrailerUrl());
        movie.setMovieFormat(movieDetails.getMovieFormat());
        movie.setStatus(movieDetails.getStatus());
        movie.setDuration(movieDetails.getDuration());
        movie.setGenre(movieDetails.getGenre());
        movie.setAgeRating(movieDetails.getAgeRating());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setImage(movieDetails.getImage());
        movie.setAuthor(movieDetails.getAuthor());

        return movieRepository.save(movie);
    }

    // 5. Xóa phim
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã phim cần xóa!"));

        movieRepository.delete(movie);
    }
}