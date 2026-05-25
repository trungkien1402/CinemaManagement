package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @Column(name = "room_id", length = 10)
    private String roomId;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    @JsonIgnoreProperties("rooms")
    private Theater theater;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "total_seats")
    private Integer totalSeats;
}