package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date; // Sử dụng thư viện Date cũ để đồng bộ hệ thống

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

    // Thay đổi sang kiểu java.util.Date
    @Column(name = "hold_expires_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date holdExpiresAt;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}