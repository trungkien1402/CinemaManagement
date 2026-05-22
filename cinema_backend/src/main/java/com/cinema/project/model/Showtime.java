package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {
    @Id
    @Column(name = "showtime_id", length = 10)
    private String showtimeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "movie_id")
    @JsonIgnoreProperties("showtimes")
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnoreProperties("showtimes")
    private Room room;

    @Column(name = "show_date")
    private LocalDate showDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "ticket_price")
    private Double ticketPrice;
}