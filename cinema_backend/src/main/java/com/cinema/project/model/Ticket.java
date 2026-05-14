package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @Column(name = "ticket_id", length = 10)
    private String ticketId;

    @ManyToOne(fetch = FetchType.EAGER)// eager lấy hết thông tin của 1 ticket
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties("tickets")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "showtime_id", nullable = false)
    @JsonIgnoreProperties("tickets")
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    @JsonIgnoreProperties("tickets")
    private Seat seat;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "booking_date")
    private LocalDateTime bookingDate = LocalDateTime.now();
}