package com.cinema.project.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private Long userId;
    private String showtimeId;
    private List<String> seatIds;
    private Double pricePerSeat;
}