package com.cinema.project.repositories;

import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.*;

@Repository
public class TicketRepository {
    public void insertTicket(Connection conn, String ticketId, String showtimeId, String userId, String seatId, double price) throws SQLException {
        String sql = "INSERT INTO tickets (ticket_id, showtime_id, user_id, seat_id, total_price, status, booking_date) VALUES (?, ?, ?, ?, ?, 'PAID', CURRENT_TIMESTAMP)";
        try (PreparedStatement pt = conn.prepareStatement(sql)) {
            pt.setString(1, ticketId); pt.setString(2, showtimeId); pt.setString(3, userId); pt.setString(4, seatId); pt.setDouble(5, price);
            pt.executeUpdate();
        }
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
}