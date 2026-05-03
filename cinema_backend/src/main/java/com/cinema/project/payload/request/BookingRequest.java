package com.cinema.project.payload.request;

import lombok.Data;

@Data
public class BookingRequest {
    private String userId;
    private String showtimeId;
    private String seatId;
    private double totalPrice;
}