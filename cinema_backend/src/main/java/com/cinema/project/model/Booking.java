package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
// 1. SỬA TÊN BẢNG THÀNH TICKET (Vì DB của bạn thực tế dùng bảng tickets)
@Table(name = "tickets")
@Data
public class Booking {

    @Id
    @Column(name = "ticket_id", length = 50) // Đồng bộ độ dài 50 ký tự tránh lỗi Truncated lúc trước
    private String ticketId;

    // 2. Kiểm tra tên cột, đổi từ "created_at" thành "booking_date" cho khớp với DB thực tế
    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(length = 20)
    private String status;

    // 3. Các mối quan hệ khóa ngoại (Foreign Key) sang bảng khác
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "showtime_id") // Khớp cột showtime_id trong DB
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id") // Khớp cột user_id trong DB
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id") // Khớp cột seat_id trong DB
    private Seat seat;
}