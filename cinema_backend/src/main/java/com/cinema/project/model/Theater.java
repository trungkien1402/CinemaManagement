package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "theaters")
@Data
public class Theater {

    @Id
    @Column(name = "theater_id")
    private String theaterId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "location", nullable = false)
    private String location;
}