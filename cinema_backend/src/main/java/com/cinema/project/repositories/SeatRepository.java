package com.cinema.project.repositories;

import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.*;

@Repository
public class SeatRepository {
    public List<Map<String, Object>> findByShowtimeId(String showtimeId) {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT s.seat_id, s.seat_number, s.seat_type, " +
                "EXISTS (SELECT 1 FROM tickets t WHERE t.seat_id = s.seat_id AND t.showtime_id = ?) as is_booked " +
                "FROM seats s JOIN showtimes st ON s.room_id = st.room_id WHERE st.showtime_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement p = conn.prepareStatement(sql)) {
            p.setString(1, showtimeId); p.setString(2, showtimeId); ResultSet rs = p.executeQuery();
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("seatId", rs.getString("seat_id")); m.put("seatNumber", rs.getString("seat_number"));
                m.put("isBooked", rs.getBoolean("is_booked")); list.add(m);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }
}