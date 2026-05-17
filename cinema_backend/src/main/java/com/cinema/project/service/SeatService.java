package com.cinema.project.service;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.repositories.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository; // Dùng để tra cứu phòng từ suất chiếu

    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    public List<Map<String, Object>> getSeatsStatusByShowtime(String showtimeId) {
        // Tìm thông tin suất chiếu xem thuộc phòng nào
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        String roomId = showtime.getRoom().getRoomId();

        // Lấy toàn bộ ghế vật lý của phòng đó lên
        List<Seat> allSeats = seatRepository.findByRoom_RoomId(roomId);

        //  Lấy danh sách mã ID những ghế đã bị mua ở RIÊNG suất chiếu này
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        // Đóng gói động trạng thái isBooked chuyển sang map JSON cho React xử lý trực quan
        List<Map<String, Object>> seatStatusList = new ArrayList<>();
        for (Seat seat : allSeats) {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("seatId", seat.getSeatId());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("seatType", seat.getSeatType());

            seatMap.put("isBooked", bookedSeatIds.contains(seat.getSeatId()));

            seatStatusList.add(seatMap);
        }

        return seatStatusList;
    }
}
