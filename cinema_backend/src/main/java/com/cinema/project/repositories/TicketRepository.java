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
    // 1. NHÓM TÍNH NĂNG ĐẶT VÉ & XEM GHẾ (CLIENT)
    // ==========================================

    // Lấy danh sách ghế đã đặt: Loại trừ các vé bị hủy để giải phóng ghế trống
    @Query("""
        SELECT t.seat.seatId
        FROM Ticket t
        WHERE t.showtime.showtimeId = :showtimeId
        AND UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
    """)
    List<String> findBookedSeatIdsByShowtime(@Param("showtimeId") String showtimeId);

    // Kiểm tra trùng ghế: Chỉ tính là đã tồn tại nếu vé đó chưa bị hủy
    @Query("""
        SELECT CASE
            WHEN COUNT(t) > 0 THEN true
            ELSE false
        END
        FROM Ticket t
        WHERE t.showtime = :showtime
        AND t.seat = :seat
        AND UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
    """)
    boolean existsByShowtimeAndSeat(@Param("showtime") Showtime showtime, @Param("seat") Seat seat);


    // ==========================================
    // 2. NHÓM TÍNH NĂNG LỊCH SỬ ĐẶT VÉ (CLIENT)
    // ==========================================

    @Query("SELECT t FROM Ticket t " +
            "LEFT JOIN FETCH t.seat " +
            "LEFT JOIN FETCH t.showtime s " +
            "LEFT JOIN FETCH s.movie " +
            "WHERE t.user.userId = :userId " +
            "ORDER BY t.bookingDate DESC")
    List<Ticket> findByUserId(@Param("userId") String userId);


    // ==========================================
    // 3. NHÓM TÍNH NĂNG THỐNG KÊ DOANH THU (ADMIN)
    // ==========================================

    // 🛠️ ĐÃ FIX: Tính doanh thu của TẤT CẢ các vé (Ngoại trừ vé Hủy)
    @Query("""
        SELECT COALESCE(SUM(t.totalPrice), 0) FROM Ticket t 
        WHERE UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
    """)
    Double calculateTotalRevenue();

    // 🛠️ ĐÃ FIX: Đếm TẤT CẢ số lượng vé hợp lệ (Ngoại trừ vé Hủy) -> Sẽ lên đủ 14 vé
    @Query("""
        SELECT COUNT(t) FROM Ticket t 
        WHERE UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
    """)
    Long countAllTickets();

    // 🛠️ ĐÃ FIX: Trả về thêm cột thứ 3 SUM(t.totalPrice) để đồng bộ dữ liệu động với Controller
    @Query("""
        SELECT m.title, COUNT(t), SUM(t.totalPrice)
        FROM Ticket t 
        JOIN t.showtime s 
        JOIN s.movie m 
        WHERE UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
        GROUP BY m.title 
        ORDER BY COUNT(t) DESC
    """)
    List<Object[]> findTopMovies();

    // 🛠️ ĐÃ FIX: Thống kê doanh thu theo tháng tự động loại trừ vé hủy
    @Query("""
        SELECT FUNCTION('MONTH', t.bookingDate), SUM(t.totalPrice) 
        FROM Ticket t 
        WHERE FUNCTION('YEAR', t.bookingDate) = :year 
        AND UPPER(TRIM(t.statusTicket)) NOT IN ('CANCELED', 'CANCELLED')
        GROUP BY FUNCTION('MONTH', t.bookingDate)
        ORDER BY FUNCTION('MONTH', t.bookingDate) ASC
    """)
    List<Object[]> findMonthlyRevenue(@Param("year") int year);


    // ==========================================
    // 4. NHÓM QUẢN LÝ ĐẶT VÉ CHO ADMIN (HÓA ĐƠN)
    // ==========================================

    @Query("""
        SELECT t FROM Ticket t 
        LEFT JOIN FETCH t.user 
        LEFT JOIN FETCH t.seat 
        LEFT JOIN FETCH t.showtime s 
        LEFT JOIN FETCH s.movie 
        ORDER BY t.bookingDate DESC
    """)
    List<Ticket> findAllBookingsForAdmin();
}