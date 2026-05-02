package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seats")
@Data
public class Seat {
    @Id
    @Column(name = "seat_id")
    private String seatId;

    @Column(name = "room_id")
    private String roomId;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(name = "seat_type")
    private String seatType;
}