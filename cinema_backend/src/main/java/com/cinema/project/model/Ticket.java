package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    @Column(name = "ticket_id", length = 50)
    private String ticketId;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(length = 20)
    private String status;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @Column(name = "status_tk")
    private Integer statusTk = 0;

    // Đã xóa bỏ toàn bộ Getter/Setter viết tay dư thừa.
    // Lombok @Data sẽ tự động lo phần còn lại một cách hoàn hảo.
}