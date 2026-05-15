package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "theaters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Theater {
    @Id
    @Column(name = "theater_id", length = 20)
    private String theaterId;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String city;

    @Column(length = 255)
    private String location;
}