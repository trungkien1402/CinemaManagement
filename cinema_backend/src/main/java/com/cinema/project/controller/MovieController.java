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
    public List<Movie> getShowingMovies() {
        return movieService.getShowingMovies();
    }
    @GetMapping("/{id}")
    public Movie getMovieDetail(@PathVariable String id) {
        return movieService.getMovieById(id);
    }
    @GetMapping("/{id}/showtimes")
    public List<Map<String, Object>> getMovieShowtimes(@PathVariable String id) {
        return movieService.getShowtimes(id);
    }
    @GetMapping("/showtimes/{showtimeId}/seats")
    public List<Map<String, Object>> getSeatsByShowtime(@PathVariable int showtimeId) {
        return movieService.getSeats(showtimeId);
    }
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        Map<String, Object> user = movieService.login(username, password);

        if (user != null) {
            return user; // Trả về thông tin user nếu đăng nhập đúng
        } else {
            // Trả về một Map báo lỗi nếu sai tài khoản
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!");
            return error;
        }
    }
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> data) {
        Map<String, String> response = new HashMap<>();

        if (movieService.registerUser(data)) {
            response.put("message", "Đăng ký thành công rồi Quân ơi! Đăng nhập ngay thôi.");
            response.put("status", "success");
        } else {
            response.put("message", "Đăng ký thất bại. Tên tài khoản hoặc Email có thể đã tồn tại!");
            response.put("status", "error");
        }
        return response;
    }
    @PostMapping("/book")
    public Map<String, String> bookTicket(@RequestBody Map<String, Object> data) {
        Map<String, String> response = new HashMap<>();
        if (movieService.bookTicket(data)) {
            response.put("message", "Đặt vé thành công! Chúc bạn xem phim vui vẻ.");
            response.put("status", "success");
        } else {
            response.put("message", "Đặt vé thất bại. Vui lòng kiểm tra lại!");
            response.put("status", "error");
        }
        return response;
    }
    @GetMapping("/user/{userId}/tickets")
    public List<Map<String, Object>> getUserTickets(@PathVariable String userId) {
        return movieService.getTicketsForUser(userId);
    }
    @GetMapping("/admin/report")
    public Map<String, Object> getRevenueReport(
            @RequestParam("theaterId") String theaterId,
            @RequestParam("date") String date) {
        return movieService.getReportByTheaterAndDate(theaterId, date);
    }
    @GetMapping("/admin/revenue/daily")
    public Map<String, Object> getDailyRevenue(@RequestParam String date) {
        Map<String, Object> response = new HashMap<>();
        double revenue = movieService.getDailyRevenue(date);

        response.put("date", date);
        response.put("totalRevenue", revenue);
        response.put("status", "success");
        return response;
    }


    @GetMapping("/admin/revenue/movies")
    public List<Map<String, Object>> getMovieRevenue() {
        return movieService.getMovieRevenue();
    }

}