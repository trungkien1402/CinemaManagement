package com.cinema.project.service;

import com.cinema.project.model.Seat;
import com.cinema.project.repositories.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    // Lấy danh sách ghế theo phòng (Cách gọi của Triển rất chuẩn)
    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

}