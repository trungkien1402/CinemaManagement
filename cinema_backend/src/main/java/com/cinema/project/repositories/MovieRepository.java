package com.cinema.project.repositories;

import com.cinema.project.model.Movie;
import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class MovieRepository {

    public List<Movie> findByStatus(int status) {
        List<Movie> movies = new ArrayList<>();
        String sql = "SELECT * FROM movies WHERE status = ?";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Movie movie = new Movie();
                movie.setMovieId(rs.getString("movie_id"));
                movie.setTitle(rs.getString("title"));
                movie.setStatus(rs.getInt("status"));
                movie.setDescription(rs.getString("description"));
                movie.setDuration(rs.getInt("duration"));
                movie.setGenre(rs.getString("genre"));
                movie.setAgeRating(rs.getString("age_rating"));
                if (rs.getDate("release_date") != null) {
                    movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                }
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                movies.add(movie);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return movies;
    }
    public Movie findById(String id) {
        String sql = "SELECT * FROM movies WHERE movie_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                Movie movie = new Movie();
                movie.setMovieId(rs.getString("movie_id"));
                movie.setTitle(rs.getString("title"));
                movie.setStatus(rs.getInt("status"));
                movie.setDescription(rs.getString("description"));
                movie.setDuration(rs.getInt("duration"));
                movie.setGenre(rs.getString("genre"));
                movie.setAgeRating(rs.getString("age_rating"));
                if (rs.getDate("release_date") != null)
                    movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                return movie;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }
    public List<Map<String, Object>> findShowtimesByMovieId(String movieId) {
        List<Map<String, Object>> showtimes = new ArrayList<>();
        // Query này join với bảng rooms để lấy luôn tên phòng cho Frontend dễ hiển thị
        String sql = "SELECT s.showtime_id, s.start_time, s.price, r.room_name " +
                "FROM showtimes s JOIN rooms r ON s.room_id = r.room_id " +
                "WHERE s.movie_id = ? AND s.start_time > NOW()"; // Chỉ lấy các suất chưa chiếu

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, movieId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("showtimeId", rs.getInt("showtime_id"));
                item.put("startTime", rs.getTimestamp("start_time").toString());
                item.put("price", rs.getDouble("price"));
                item.put("roomName", rs.getString("room_name"));
                showtimes.add(item);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return showtimes;
    }
    public List<Map<String, Object>> findSeatsByShowtimeId(int showtimeId) {
        List<Map<String, Object>> seats = new ArrayList<>();
        // Join showtimes -> rooms -> seats để lấy đúng ghế của phòng đó
        String sql = "SELECT s.seat_id, s.seat_number, s.seat_type, " +
                "EXISTS (SELECT 1 FROM tickets t WHERE t.seat_id = s.seat_id AND t.showtime_id = ?) as is_booked " +
                "FROM seats s " +
                "JOIN rooms r ON s.room_id = r.room_id " +
                "JOIN showtimes st ON r.room_id = st.room_id " +
                "WHERE st.showtime_id = ?";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, showtimeId);
            pstmt.setInt(2, showtimeId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> seat = new HashMap<>();
                seat.put("seatId", rs.getInt("seat_id"));
                seat.put("seatNumber", rs.getString("seat_number"));
                seat.put("seatType", rs.getString("seat_type"));
                seat.put("isBooked", rs.getBoolean("is_booked")); // Để Frontend tô màu ghế đã có người đặt
                seats.add(seat);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return seats;
    }
    public Map<String, Object> checkLogin(String username, String password) {
        String sql = "SELECT user_id, username, email, phone, gender FROM users WHERE username = ? AND password = ?";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, username);
            pstmt.setString(2, password);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                // Map chuẩn theo tên cột trong DB của ông
                user.put("userId", rs.getString("user_id"));
                user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("gender", rs.getString("gender"));
                return user;
            }
        } catch (SQLException e) {
            System.err.println("Lỗi DB: " + e.getMessage());
        }
        return null; // Trả về null nếu sai user/pass
    }
    public boolean register(String username, String password, String email, String phone, String gender) {
        String userId = "U" + System.currentTimeMillis() % 1000000;
        String sql = "INSERT INTO users (user_id, username, password, email, phone, gender, role) VALUES (?, ?, ?, ?, ?, ?, 'USER')";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, userId);
            pstmt.setString(2, username);
            pstmt.setString(3, password);
            pstmt.setString(4, email);
            pstmt.setString(5, phone);
            pstmt.setString(6, gender);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // In lỗi ra Console để ông soi nếu vẫn tạch
            System.err.println("Lỗi SQL Register: " + e.getMessage());
            return false;
        }
    }
    public boolean createTicket(String userId, String showtimeId, String seatId, double totalPrice) {
        String ticketId = "T" + System.currentTimeMillis() % 1000000;

        String sql = "INSERT INTO tickets (ticket_id, showtime_id, user_id, seat_id, total_price, status, booking_date) " +
                "VALUES (?, ?, ?, ?, ?, 'PAID', CURRENT_TIMESTAMP)";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, ticketId);
            pstmt.setString(2, showtimeId);
            pstmt.setString(3, userId);
            pstmt.setString(4, seatId);
            pstmt.setDouble(5, totalPrice);

            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Lỗi Đặt vé: " + e.getMessage());
            return false;
        }
    }
    public List<Map<String, Object>> getTicketsByUser(String userId) {
        List<Map<String, Object>> tickets = new ArrayList<>();
        // Câu lệnh SQL JOIN bảng tickets với showtimes và movies để lấy tên phim
        String sql = "SELECT t.ticket_id, m.title, s.show_date, s.start_time, t.seat_id, t.total_price, t.status, t.booking_date " +
                "FROM public.tickets t " +
                "JOIN public.showtimes s ON t.showtime_id = s.showtime_id " +
                "JOIN public.movies m ON s.movie_id = m.movie_id " +
                "WHERE t.user_id = ? ORDER BY t.booking_date DESC";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Map<String, Object> ticket = new HashMap<>();
                ticket.put("ticketId", rs.getString("ticket_id"));
                ticket.put("movieTitle", rs.getString("title"));
                ticket.put("showDate", rs.getDate("show_date"));
                ticket.put("startTime", rs.getTime("start_time"));
                ticket.put("seatId", rs.getString("seat_id"));
                ticket.put("totalPrice", rs.getDouble("total_price"));
                ticket.put("status", rs.getString("status"));
                ticket.put("bookingDate", rs.getTimestamp("booking_date"));
                tickets.add(ticket);
            }
        } catch (SQLException e) {
            System.err.println("Lỗi lấy lịch sử vé: " + e.getMessage());
        }
        return tickets;
    }
    public Map<String, Object> getRevenueReport(String theaterId, String reportDate) {
        Map<String, Object> report = new HashMap<>();
        String sql = "SELECT theater_id, SUM(total_revenue) AS total_revenue " +
                "FROM public.reports " +
                "WHERE theater_id = ? AND report_date = ? " +
                "GROUP BY theater_id";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, theaterId);
            pstmt.setDate(2, java.sql.Date.valueOf(reportDate));
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                report.put("theaterId", rs.getString("theater_id"));
                report.put("totalRevenue", rs.getDouble("total_revenue"));
                report.put("reportDate", reportDate);
                report.put("status", "success");
            } else {
                report.put("message", "Không tìm thấy dữ liệu doanh thu cho rạp này vào ngày " + reportDate);
                report.put("status", "empty");
            }
        } catch (SQLException e) {
            System.err.println("Lỗi lấy báo cáo: " + e.getMessage());
            report.put("message", "Lỗi: " + e.getMessage());
            report.put("status", "error");
        }
        return report;
    }
    public void updateReport(String theaterId, String movieId, String date, double amount) {
        String sql = "INSERT INTO public.reports (report_id, theater_id, movie_id, report_date, total_revenue) " +
                "VALUES (?, ?, ?, ?, ?) " +
                "ON CONFLICT (theater_id, report_date, movie_id) " +
                "DO UPDATE SET total_revenue = public.reports.total_revenue + EXCLUDED.total_revenue;";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String reportId = "RPT" + System.currentTimeMillis() % 1000000;
            pstmt.setString(1, reportId);
            pstmt.setString(2, theaterId);
            pstmt.setString(3, movieId);
            pstmt.setDate(4, java.sql.Date.valueOf(date));
            pstmt.setDouble(5, amount);

            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Lỗi cập nhật báo cáo: " + e.getMessage());
        }
    }
    // Lấy mã phim theo mã lịch chiếu
    public String getMovieIdByShowtimeId(String showtimeId) {
        String sql = "SELECT movie_id FROM public.showtimes WHERE showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, showtimeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return rs.getString("movie_id");
            }
        } catch (SQLException e) {
            System.err.println("Lỗi getMovieIdByShowtimeId: " + e.getMessage());
        }
        return null;
    }

    // Lấy mã rạp theo mã lịch chiếu
    public String getTheaterIdByShowtimeId(String showtimeId) {
        String sql = "SELECT r.theater_id FROM public.showtimes s JOIN public.rooms r ON s.room_id = r.room_id WHERE s.showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, showtimeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return rs.getString("theater_id");
            }
        } catch (SQLException e) {
            System.err.println("Lỗi getTheaterIdByShowtimeId: " + e.getMessage());
        }
        return null;
    }
    public List<Map<String, Object>> getRevenueByMovie() {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT m.title, SUM(r.total_revenue) as total_revenue " +
                "FROM public.reports r " +
                "JOIN public.movies m ON r.movie_id = m.movie_id " +
                "GROUP BY m.title";

        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("movieTitle", rs.getString("title"));
                map.put("totalRevenue", rs.getDouble("total_revenue"));
                result.add(map);
            }
        } catch (SQLException e) {
            System.err.println("Lỗi thống kê theo phim: " + e.getMessage());
        }
        return result;
    }
    public double getRevenueByDate(String date) {
        String sql = "SELECT SUM(total_revenue) FROM public.reports WHERE report_date = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, java.sql.Date.valueOf(date));
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("Lỗi thống kê theo ngày: " + e.getMessage());
        }
        return 0.0;
    }
}