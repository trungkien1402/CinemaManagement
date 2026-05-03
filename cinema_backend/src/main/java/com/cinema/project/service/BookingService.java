package com.cinema.project.service;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.repositories.TicketRepository;
import com.cinema.project.repositories.ReportRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.config.ConnectionDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.sql.*;

@Service
public class BookingService {
    @Autowired
    private TicketRepository ticketRepo;

    @Autowired
    private ReportRepository reportRepo;

    @Autowired
    private ShowtimeRepository showtimeRepo; // Đã đổi từ MovieRepository sang đây để fix lỗi

    public boolean bookTicket(BookingRequest req) {
        String ts = String.valueOf(System.currentTimeMillis());
        String ticketId = "T" + ts.substring(ts.length() - 9);

        try (Connection conn = ConnectionDatabase.getConnection()) {
            conn.setAutoCommit(false);

            // Gọi hàm từ showtimeRepo để lấy thông tin ID phim và rạp
            String movieId = showtimeRepo.getMovieIdByShowtimeId(req.getShowtimeId());
            String theaterId = showtimeRepo.getTheaterIdByShowtimeId(req.getShowtimeId());

            if (movieId == null || theaterId == null) {
                conn.rollback();
                return false;
            }

            // Thực hiện lưu vé và cập nhật doanh thu trong 1 Transaction
            ticketRepo.insertTicket(conn, ticketId, req.getShowtimeId(), req.getUserId(), req.getSeatId(), req.getTotalPrice());
            reportRepo.upsertReport(conn, theaterId, movieId, req.getTotalPrice());

            conn.commit();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}