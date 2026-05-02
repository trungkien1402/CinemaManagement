package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @Column(name = "room_id")
    private String roomId;

    @Column(name = "theater_id")
    private String theaterId;

    @Column(name = "room_number", nullable = false)
    private int roomNumber;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;
}