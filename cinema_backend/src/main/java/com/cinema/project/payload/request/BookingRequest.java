package com.cinema.project.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private Long userId;
    private String showtimeId;
    private List<String> seatIds;
    private Long pricePerSeat; // Đổi sang Long để quản lý tiền tệ chính xác
    private Long totalPrice;   // Đổi sang Long để không bao giờ bị dính đuôi ".0"
}