package com.cinema.project.repositories;

import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.*;

@Repository
public class UserRepository {
    public Map<String, Object> checkLogin(String u, String p) {
        String sql = "SELECT user_id, username, email FROM users WHERE username = ? AND password = ?";
        try (Connection conn = ConnectionDatabase.getConnection(); PreparedStatement pt = conn.prepareStatement(sql)) {
            pt.setString(1, u); pt.setString(2, p); ResultSet rs = pt.executeQuery();
            if (rs.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("userId", rs.getString("user_id")); user.put("username", rs.getString("username"));
                return user;
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
}