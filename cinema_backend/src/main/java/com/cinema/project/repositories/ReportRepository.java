package com.cinema.project.repositories;

import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.*;

@Repository
public class ReportRepository {

    // Hàm lấy doanh thu theo ngày (đã có)
    public double getRevenueByDate(String date) {
        String sql = "SELECT COALESCE(SUM(total_revenue), 0) FROM reports WHERE report_date = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement p = conn.prepareStatement(sql)) {
            p.setDate(1, java.sql.Date.valueOf(date));
            ResultSet rs = p.executeQuery();
            if (rs.next()) return rs.getDouble(1);
        } catch (SQLException e) { e.printStackTrace(); }
        return 0.0;
    }

    // --- THÊM HÀM NÀY VÀO ĐÂY ---
    public List<Map<String, Object>> getRevenueByMovie() {
        List<Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT m.title, SUM(r.total_revenue) as total_revenue " +
                "FROM public.reports r JOIN public.movies m ON r.movie_id = m.movie_id " +
                "GROUP BY m.title ORDER BY total_revenue DESC";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("movieTitle", rs.getString("title"));
                map.put("totalRevenue", rs.getDouble("total_revenue"));
                result.add(map);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return result;
    }

    public void upsertReport(Connection conn, String theaterId, String movieId, double price) throws SQLException {
        String reportId = "RPT_" + theaterId + "_" + movieId + "_" + java.time.LocalDate.now();
        String sql = "INSERT INTO public.reports (report_id, theater_id, movie_id, report_date, total_revenue) " +
                "VALUES (?, ?, ?, CURRENT_DATE, ?) ON CONFLICT (report_id) DO UPDATE SET total_revenue = public.reports.total_revenue + EXCLUDED.total_revenue";
        try (PreparedStatement pr = conn.prepareStatement(sql)) {
            pr.setString(1, reportId); pr.setString(2, theaterId); pr.setString(3, movieId); pr.setDouble(4, price);
            pr.executeUpdate();
        }
    }
}