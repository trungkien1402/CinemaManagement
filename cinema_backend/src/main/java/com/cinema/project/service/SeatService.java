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


    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    // Hàm cập nhật trạng thái ghế khi có người đặt thành công
    public void updateSeatStatus(String seatId, boolean status) {
        Seat seat = seatRepository.findById(seatId).orElseThrow();
        seat.setIsOccupied(status);
        seatRepository.save(seat);
    }
}