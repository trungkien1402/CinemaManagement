package com.cinema.project.repositories;

import com.cinema.project.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    // Tìm danh sách ID ghế đã có người mua thành công trong 1 suất chiếu cụ thể
    @Query("SELECT t.seat.seatId FROM Ticket t WHERE t.showtime.showtimeId = :showtimeId AND t.status = 'SUCCESS'")
    List<String> findBookedSeatIdsByShowtime(@Param("showtimeId") String showtimeId);
}