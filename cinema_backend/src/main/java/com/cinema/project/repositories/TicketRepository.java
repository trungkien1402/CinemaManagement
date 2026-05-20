package com.cinema.project.repositories;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.model.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String> {

    // Lấy danh sách ghế đã đặt theo suất chiếu
    @Query("""
        SELECT t.seat.seatId
        FROM Ticket t
        WHERE t.showtime.showtimeId = :showtimeId
        AND t.status = 'BOOKED'
    """)
    List<String> findBookedSeatIdsByShowtime(
            @Param("showtimeId") String showtimeId
    );

    // Kiểm tra ghế đã được đặt chưa
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
    boolean existsByShowtimeAndSeat(
            @Param("showtime") Showtime showtime,
            @Param("seat") Seat seat
    );
}