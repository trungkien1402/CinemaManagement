package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @Column(name = "ticket_id")
    private String ticketId;

    @Column(name = "showtime_id")
    private String showtimeId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "seat_id")
    private String seatId;

    @Column(name = "total_price", nullable = false)
    private double totalPrice;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;
}