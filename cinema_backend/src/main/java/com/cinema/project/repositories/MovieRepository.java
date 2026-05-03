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
                if (rs.getDate("release_date") != null) movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                movies.add(movie);
            }
        } catch (SQLException e) { e.printStackTrace(); }
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
                if (rs.getDate("release_date") != null) movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                return movie;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public List<Map<String, Object>> findShowtimesByMovieId(String movieId) {
        List<Map<String, Object>> showtimes = new ArrayList<>();
        // ĐÃ FIX: r.room_number
        String sql = "SELECT s.showtime_id, s.start_time, s.ticket_price, r.room_number " +
                "FROM showtimes s JOIN rooms r ON s.room_id = r.room_id " +
                "WHERE s.movie_id = ? AND s.show_date >= CURRENT_DATE";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, movieId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("showtimeId", rs.getString("showtime_id"));
                item.put("startTime", rs.getString("start_time")); // Lấy String cho đẹp
                item.put("price", rs.getDouble("ticket_price"));
                item.put("roomName", rs.getString("room_number"));
                showtimes.add(item);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return showtimes;
    }

    public List<Map<String, Object>> findSeatsByShowtimeId(String showtimeId) {
        List<Map<String, Object>> seats = new ArrayList<>();
        String sql = "SELECT s.seat_id, s.seat_number, s.seat_type, " +
                "EXISTS (SELECT 1 FROM tickets t WHERE t.seat_id = s.seat_id AND t.showtime_id = ?) as is_booked " +
                "FROM seats s JOIN rooms r ON s.room_id = r.room_id " +
                "JOIN showtimes st ON r.room_id = st.room_id WHERE st.showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, showtimeId);
            pstmt.setString(2, showtimeId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> seat = new HashMap<>();
                seat.put("seatId", rs.getString("seat_id"));
                seat.put("seatNumber", rs.getString("seat_number"));
                seat.put("seatType", rs.getString("seat_type"));
                seat.put("isBooked", rs.getBoolean("is_booked"));
                seats.add(seat);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return seats;
    }

    public boolean processBooking(String userId, String showtimeId, String seatId, double price) {
        String ticketId = "T" + (System.currentTimeMillis() % 100000000);
        String sqlTicket = "INSERT INTO tickets (ticket_id, showtime_id, user_id, seat_id, total_price, status, booking_date) VALUES (?, ?, ?, ?, ?, 'PAID', CURRENT_TIMESTAMP)";

        // ĐÃ FIX: Chỉ 4 dấu hỏi (?) cho sqlReport
        String sqlReport = "INSERT INTO public.reports (report_id, theater_id, movie_id, report_date, total_revenue) " +
                "VALUES (?, ?, ?, CURRENT_DATE, ?) ON CONFLICT (report_id) DO UPDATE SET total_revenue = public.reports.total_revenue + EXCLUDED.total_revenue";

        try (Connection conn = ConnectionDatabase.getConnection()) {
            conn.setAutoCommit(false);
            String movieId = getMovieIdByShowtimeId(showtimeId);
            String theaterId = getTheaterIdByShowtimeId(showtimeId);
            if (movieId == null || theaterId == null) { conn.rollback(); return false; }

            try (PreparedStatement pt = conn.prepareStatement(sqlTicket)) {
                pt.setString(1, ticketId); pt.setString(2, showtimeId); pt.setString(3, userId); pt.setString(4, seatId); pt.setDouble(5, price);
                pt.executeUpdate();
            }
            try (PreparedStatement pr = conn.prepareStatement(sqlReport)) {
                String rId = "RPT_" + theaterId + "_" + movieId + "_" + java.time.LocalDate.now();
                pr.setString(1, rId); pr.setString(2, theaterId); pr.setString(3, movieId); pr.setDouble(4, price);
                pr.executeUpdate();
            }
            conn.commit();
            return true;
        } catch (SQLException e) { System.err.println("Lỗi Transaction: " + e.getMessage()); return false; }
    }

    public String getMovieIdByShowtimeId(String id) {
        String sql = "SELECT movie_id FROM showtimes WHERE showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, id); ResultSet rs = p.executeQuery(); if (rs.next()) return rs.getString("movie_id");
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public String getTheaterIdByShowtimeId(String id) {
        String sql = "SELECT r.theater_id FROM showtimes s JOIN rooms r ON s.room_id = r.room_id WHERE s.showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, id); ResultSet rs = p.executeQuery(); if (rs.next()) return rs.getString("theater_id");
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public double getRevenueByDate(String date) {
        String sql = "SELECT COALESCE(SUM(total_revenue), 0) FROM reports WHERE report_date = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setDate(1, java.sql.Date.valueOf(date)); ResultSet rs = p.executeQuery(); if (rs.next()) return rs.getDouble(1);
        } catch (SQLException e) { e.printStackTrace(); }
        return 0.0;
    }

    public List<Map<String, Object>> getTicketsByUser(String userId) {
        List<Map<String, Object>> tickets = new ArrayList<>();
        String sql = "SELECT t.ticket_id, m.title, s.show_date, s.start_time, t.seat_id, t.total_price, t.status, t.booking_date " +
                "FROM tickets t JOIN showtimes s ON t.showtime_id = s.showtime_id " +
                "JOIN movies m ON s.movie_id = m.movie_id WHERE t.user_id = ? ORDER BY t.booking_date DESC";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, userId); ResultSet rs = p.executeQuery();
            while (rs.next()) {
                Map<String, Object> t = new HashMap<>();
                t.put("ticketId", rs.getString("ticket_id")); t.put("movieTitle", rs.getString("title"));
                t.put("showDate", rs.getDate("show_date")); t.put("startTime", rs.getString("start_time"));
                t.put("seatId", rs.getString("seat_id")); t.put("totalPrice", rs.getDouble("total_price"));
                t.put("status", rs.getString("status")); t.put("bookingDate", rs.getTimestamp("booking_date"));
                tickets.add(t);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return tickets;
    }

    public Map<String, Object> checkLogin(String u, String p) {
        String sql = "SELECT user_id, username, email, phone, gender FROM users WHERE username = ? AND password = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement pt = conn.prepareStatement(sql)) {
            pt.setString(1, u); pt.setString(2, p); ResultSet rs = pt.executeQuery();
            if (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("userId", rs.getString("user_id")); user.put("username", rs.getString("username"));
                user.put("email", rs.getString("email")); user.put("phone", rs.getString("phone"));
                user.put("gender", rs.getString("gender")); return user;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean register(String u, String p, String e, String ph, String g) {
        String userId = "U" + (System.currentTimeMillis() % 1000000);
        String sql = "INSERT INTO users (user_id, username, password, email, phone, gender, role) VALUES (?, ?, ?, ?, ?, ?, 'USER')";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement pt = conn.prepareStatement(sql)) {
            pt.setString(1, userId); pt.setString(2, u); pt.setString(3, p); pt.setString(4, e); pt.setString(5, ph); pt.setString(6, g);
            return pt.executeUpdate() > 0;
        } catch (SQLException ex) { ex.printStackTrace(); return false; }
    }
    public List<Map<String, Object>> getRevenueByMovie() {
        List<Map<String, Object>> result = new ArrayList<>();
        // SQL: Lấy tiêu đề phim và tổng doanh thu, nhóm theo tiêu đề
        String sql = "SELECT m.title, SUM(r.total_revenue) as total_revenue " +
                "FROM public.reports r " +
                "JOIN public.movies m ON r.movie_id = m.movie_id " +
                "GROUP BY m.title " +
                "ORDER BY total_revenue DESC"; // Phim nhiều tiền nhất lên đầu

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
}