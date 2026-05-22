package com.cinema.project.payload.request;

import lombok.Data;

@Data
public class RoomCreationRequest{
    private String roomId;
    private Integer roomNumber;
    private Integer rowsCount;
    private Integer colsCount;
}
