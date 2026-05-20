package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "booking_seats")
@Data
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @Column(name = "price")
    private Double price;
}