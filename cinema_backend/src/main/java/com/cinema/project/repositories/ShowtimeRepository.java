package com.cinema.project.repositories;

import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.*;

@Repository
public class ShowtimeRepository {
    // Hàm lấy danh sách lịch chiếu (đã có)
    public List<Map<String, Object>> findByMovieId(String movieId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT s.showtime_id, s.start_time, s.ticket_price, r.room_number " +
                "FROM showtimes s JOIN rooms r ON s.room_id = r.room_id " +
                "WHERE s.movie_id = ? AND s.show_date >= CURRENT_DATE";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, movieId); ResultSet rs = p.executeQuery();
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("showtimeId", rs.getString("showtime_id")); m.put("startTime", rs.getString("start_time"));
                m.put("price", rs.getDouble("ticket_price")); m.put("roomName", "Phòng " + rs.getInt("room_number"));
                list.add(m);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    // --- THÊM 2 HÀM NÀY VÀO ---
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
}