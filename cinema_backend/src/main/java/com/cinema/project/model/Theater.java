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

    @Column(name = "name", length = 100, columnDefinition = "nvarchar(100)")
    private String name;

    @Column(name = "city", length = 50, columnDefinition = "nvarchar(50)")
    private String city;

    // 💡 Đã gộp và sửa lại thành nvarchar để nhận tiếng Việt có dấu từ DB
    @Column(name = "location", length = 255, columnDefinition = "nvarchar(255)")
    private String location;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "operating_hours", columnDefinition = "nvarchar(100)")
    private String operatingHours;
}