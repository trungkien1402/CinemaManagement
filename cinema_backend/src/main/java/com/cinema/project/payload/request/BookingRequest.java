package com.cinema.project.payload.request;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private Long userId;
    private String showtimeId;
    private List<String> seatIds;
    private Long pricePerSeat;
    private Long totalPrice;

    // 🚀 THÊM MỚI: Số điểm khách hàng muốn sử dụng để giảm giá
    private Integer pointsToUse;
}