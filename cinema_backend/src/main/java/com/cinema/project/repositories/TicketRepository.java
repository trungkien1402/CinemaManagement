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

    // ==========================================
    // 1. NHÓM TÍNH NĂNG ĐẶT VÉ & XEM GHẾ
    // ==========================================

    /**
     * Lấy danh sách mã ghế (seatId) đã được đặt dựa theo mã suất chiếu (showtimeId)
     * Chỉ lấy những vé có trạng thái là 'BOOKED'
     */
    @Query("""
        SELECT t.seat.seatId
        FROM Ticket t
        WHERE t.showtime.showtimeId = :showtimeId
        AND t.status = 'BOOKED'
    """)
    List<String> findBookedSeatIdsByShowtime(@Param("showtimeId") String showtimeId);

    /**
     * Kiểm tra xem ghế đã được đặt cho suất chiếu này hay chưa (Tránh đặt trùng)
     */
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


    // ==========================================
    // 2. NHÓM TÍNH NĂNG LỊCH SỬ ĐẶT VÉ (Khách hàng)
    // ==========================================

    /**
     * Lấy danh sách lịch sử đặt vé của một User (Sắp xếp vé mới nhất lên đầu)
     * Sử dụng LEFT JOIN FETCH để tối ưu hiệu năng, tránh lỗi N+1 Query
     */
    @Query("SELECT t FROM Ticket t " +
            "LEFT JOIN FETCH t.seat " +
            "LEFT JOIN FETCH t.showtime s " +
            "LEFT JOIN FETCH s.movie " +
            "WHERE t.user.userId = :userId " +
            "ORDER BY t.bookingDate DESC")
    List<Ticket> findByUserId(@Param("userId") Long userId);


    // ==========================================
    // 3. NHÓM TÍNH NĂNG THỐNG KÊ DOANH THU (Admin)
    // ==========================================

    /**
     * Tính tổng doanh thu từ trước đến nay (Nếu chưa có vé nào sẽ trả về 0)
     */
    @Query("SELECT COALESCE(SUM(t.totalPrice), 0) FROM Ticket t")
    Double calculateTotalRevenue();

    /**
     * Đếm tổng số lượng vé đã bán ra hệ thống
     */
    @Query("SELECT COUNT(t) FROM Ticket t")
    Long countAllTickets();
}