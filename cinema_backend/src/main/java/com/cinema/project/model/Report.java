package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "reports")
@Data
public class Report {
    @Id
    @Column(name = "report_id")
    private String reportId;

    @Column(name = "theater_id")
    private String theaterId;

    @Column(name = "movie_id")
    private String movieId;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "total_revenue", nullable = false)
    private double totalRevenue;
}