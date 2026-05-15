package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "seats")
@Data
public class Seat {
    @Id
    @Column(name = "seat_id", length = 10)
    private String seatId;

    @Column(name = "seat_number", length = 10)
    private String seatNumber;

    @Column(name = "seat_type", length = 20)
    private String seatType;

    @Column(name = "is_occupied")
    private Boolean isOccupied;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}