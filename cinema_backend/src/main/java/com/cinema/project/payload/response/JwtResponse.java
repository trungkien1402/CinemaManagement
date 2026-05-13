package com.cinema.project.payload.response;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String email;
    private String role; // Frontend sẽ dựa vào cái này để chuyển trang cái này để chuyển sang trang admin
}