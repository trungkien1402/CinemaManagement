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

    public List<Movie> getShowingMovies() { return movieRepository.findByStatus(1); }
    public Movie getMovieById(String id) { return movieRepository.findById(id); }
    public List<Map<String, Object>> getShowtimes(String movieId) { return movieRepository.findShowtimesByMovieId(movieId); }
    public List<Map<String, Object>> getSeats(String showtimeId) { return movieRepository.findSeatsByShowtimeId(showtimeId); }
    public Map<String, Object> login(String u, String p) { return movieRepository.checkLogin(u, p); }
    public boolean registerUser(Map<String, String> data) {
        return movieRepository.register(data.get("username"), data.get("password"), data.get("email"), data.get("phone"), data.get("gender"));
    }
    public boolean bookTicket(Map<String, Object> data) {
        return movieRepository.processBooking(
                data.get("userId").toString(),
                data.get("showtimeId").toString(),
                data.get("seatId").toString(),
                Double.parseDouble(data.get("totalPrice").toString())
        );
    }
    public List<Map<String, Object>> getTicketsForUser(String userId) { return movieRepository.getTicketsByUser(userId); }
    public double getDailyRevenue(String date) { return movieRepository.getRevenueByDate(date); }
    public List<Map<String, Object>> getMovieRevenue() {
        return movieRepository.getRevenueByMovie();
    }
}