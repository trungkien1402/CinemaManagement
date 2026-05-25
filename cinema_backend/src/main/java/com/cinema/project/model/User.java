package com.cinema.project.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "phone", nullable = false, unique = true, length = 12)
    private String phone;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    // 💡 ĐÃ THÊM 2 TRƯỜNG NÀY ĐỂ ĐỒNG BỘ VỚI FRONTEND VÀ HẾT ĐỎ CONTROLLER
    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "date_of_birth")
    private String dateOfBirth;
}