package com.cinema.project.controller;

import com.cinema.project.model.Movie;
import com.cinema.project.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {
    @Autowired
    private MovieService movieService;

    @GetMapping("/showing")
    public List<Movie> getShowingMovies() { return movieService.getShowingMovies(); }

    @GetMapping("/{id}")
    public Movie getMovieDetail(@PathVariable String id) { return movieService.getMovieById(id); }

    @GetMapping("/{id}/showtimes")
    public List<Map<String, Object>> getMovieShowtimes(@PathVariable String id) { return movieService.getShowtimes(id); }

    @GetMapping("/showtimes/{showtimeId}/seats")
    public List<Map<String, Object>> getSeatsByShowtime(@PathVariable String showtimeId) { return movieService.getSeats(showtimeId); }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> data) {
        Map<String, Object> user = movieService.login(data.get("username"), data.get("password"));
        if (user != null) return user;
        Map<String, Object> err = new HashMap<>(); err.put("message", "Sai tài khoản!"); return err;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> data) {
        Map<String, String> res = new HashMap<>();
        if (movieService.registerUser(data)) { res.put("status", "success"); }
        else { res.put("status", "error"); }
        return res;
    }

    @PostMapping("/book")
    public Map<String, String> bookTicket(@RequestBody Map<String, Object> data) {
        Map<String, String> res = new HashMap<>();
        if (movieService.bookTicket(data)) {
            res.put("message", "Đặt vé thành công!");
            res.put("status", "success");
        } else {
            res.put("message", "Đặt vé thất bại!");
            res.put("status", "error");
        }
        return res;
    }

    @GetMapping("/user/{userId}/tickets")
    public List<Map<String, Object>> getUserTickets(@PathVariable String userId) {
        return movieService.getTicketsForUser(userId);
    }

    @GetMapping("/admin/revenue/daily")
    public Map<String, Object> getDailyRevenue(@RequestParam String date) {
        Map<String, Object> res = new HashMap<>();
        res.put("date", date);
        res.put("totalRevenue", movieService.getDailyRevenue(date));
        res.put("status", "success");
        return res;
    }
    @GetMapping("/admin/revenue/movies")
    public List<Map<String, Object>> getMovieRevenue() {
        return movieService.getMovieRevenue();
    }
}