package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "showtimes")
@Data
public class Showtime {
    @Id
    @Column(name = "showtime_id")
    private String showtimeId;

    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "room_id")
    private String roomId;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "ticket_price", nullable = false)
    private double ticketPrice;
}