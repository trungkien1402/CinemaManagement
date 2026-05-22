package com.cinema.project.repositories;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    // 1. Lấy danh sách ghế đã đặt theo suất chiếu
    @Query("""
        SELECT t.seat.seatId
        FROM Ticket t
        WHERE t.showtime.showtimeId = :showtimeId
        AND t.status = 'BOOKED'
    """)
    List<String> findBookedSeatIdsByShowtime(@Param("showtimeId") String showtimeId);

    // 2. Kiểm tra ghế đã được đặt chưa
    @Query("""
        SELECT CASE
            WHEN COUNT(t) > 0 THEN true
            ELSE false
        END
        FROM Ticket t
        WHERE t.showtime = :showtime
        AND t.seat = :seat
        AND t.status = 'BOOKED'
    """)
    boolean existsByShowtimeAndSeat(@Param("showtime") Showtime showtime, @Param("seat") Seat seat);

    // 3. Tính tổng doanh thu (Dùng totalPrice như trong Entity Ticket.java)
    @Query("SELECT COALESCE(SUM(t.totalPrice), 0) FROM Ticket t")
    Double calculateTotalRevenue();

    // 4. Đếm tổng số lượng vé
    @Query("SELECT COUNT(t) FROM Ticket t")
    Long countAllTickets();
}