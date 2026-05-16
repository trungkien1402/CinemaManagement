package com.cinema.project.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private String seatId;
    private String seatNumber;
    private String seatType;
    private boolean isOccupied;
}