package com.cinema.project.repositories;

import com.cinema.project.model.Ticket;
import com.cinema.project.model.Showtime;
import com.cinema.project.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String> {

    /**
     * Kiểm tra xem ghế đã được đặt cho suất chiếu này hay chưa
     */
    boolean existsByShowtimeAndSeat(Showtime showtime, Seat seat);

    /**
     * Lấy danh sách mã ghế (seatId) đã được đặt dựa theo mã suất chiếu (showtimeId)
     */
    @Query("SELECT t.seat.seatId FROM Ticket t WHERE t.showtime.showtimeId = :showtimeId")
    List<String> findBookedSeatIdsByShowtime(@Param("showtimeId") String showtimeId);

    /**
     * Lấy danh sách lịch sử đặt vé của một User theo userId kiểu Long (Sắp xếp vé mới nhất lên đầu)
     */
    @Query("SELECT t FROM Ticket t " +
            "LEFT JOIN FETCH t.seat " +
            "LEFT JOIN FETCH t.showtime s " +
            "LEFT JOIN FETCH s.movie " +
            "WHERE t.user.userId = :userId " +
            "ORDER BY t.bookingDate DESC")
    List<Ticket> findByUserId(@Param("userId") Long userId);
}