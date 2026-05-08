package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getShowingMovies() {
        // Lấy phim đang chiếu (status = 1)
        return movieRepository.findByStatus(1);
    }
    public Movie getMovieById(String id) {
        return movieRepository.findById(id);
    }
    public List<Map<String, Object>> getShowtimes(String movieId) {
        return movieRepository.findShowtimesByMovieId(movieId);
    }
    public List<Map<String, Object>> getSeats(int showtimeId) {
        return movieRepository.findSeatsByShowtimeId(showtimeId);
    }
    public Map<String, Object> login(String username, String password) {
        return movieRepository.checkLogin(username, password);
    }
    public boolean registerUser(Map<String, String> data) {
        return movieRepository.register(
                data.get("username"),
                data.get("password"),
                data.get("email"),
                data.get("phone"),
                data.get("gender")
        );
    }
    public boolean bookTicket(Map<String, Object> data) {
        try {
            String showtimeId = data.get("showtimeId").toString();

            // 1. Tự động lấy movieId và roomId/theaterId từ showtimeId
            String movieId = movieRepository.getMovieIdByShowtimeId(showtimeId);
            String theaterId = movieRepository.getTheaterIdByShowtimeId(showtimeId); // Nếu chưa có hàm này, xem chú thích bên dưới

            if (movieId == null || theaterId == null) {
                System.err.println("Không tìm thấy thông tin phim hoặc rạp từ showtimeId này!");
                return false;
            }

            // 2. Thực hiện tạo vé
            boolean isTicketCreated = movieRepository.createTicket(
                    data.get("userId").toString(),
                    showtimeId,
                    data.get("seatId").toString(),
                    Double.parseDouble(data.get("totalPrice").toString())
            );

            // 3. Tự động cập nhật doanh thu
            if (isTicketCreated) {
                java.time.LocalDate today = java.time.LocalDate.now();
                movieRepository.updateReport(
                        theaterId,
                        movieId,
                        today.toString(),
                        Double.parseDouble(data.get("totalPrice").toString())
                );
                return true;
            }
        } catch (Exception e) {
            System.err.println("Lỗi trong quá trình xử lý đặt vé: " + e.getMessage());
        }
        return false;
    }
    public List<Map<String, Object>> getTicketsForUser(String userId) {
        return movieRepository.getTicketsByUser(userId);
    }
    public Map<String, Object> getReportByTheaterAndDate(String theaterId, String reportDate) {
        return movieRepository.getRevenueReport(theaterId, reportDate);
    }
    public List<Map<String, Object>> getMovieRevenue() {
        return movieRepository.getRevenueByMovie();
    }
    public double getDailyRevenue(String date) {
        return movieRepository.getRevenueByDate(date);
    }
}