package com.cinema.project.service;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.repositories.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;

    // 1. Lấy tất cả ghế vật lý theo mã phòng (Cấu hình Admin)
    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    // 2. Lấy trạng thái khóa/mở ghế theo suất chiếu phục vụ Client đặt vé
    public List<Map<String, Object>> getSeatsStatusByShowtime(String showtimeId) {

        // Bước 1: Tìm thông tin suất chiếu để xác định phòng chiếu
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        String roomId = showtime.getRoom().getRoomId();

        // Bước 2: Lấy toàn bộ ghế vật lý của phòng đó lên
        List<Seat> allSeats = seatRepository.findByRoom_RoomId(roomId);

        // Bước 3: Lấy danh sách ID ghế đã có vé đặt thành công cho suất chiếu này
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        // Bước 4: Chuyển đổi dữ liệu sang dạng Map (JSON) để trả về Frontend
        return allSeats.stream().map(seat -> {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("seatId", seat.getSeatId());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("seatType", seat.getSeatType());

            // LOGIC KHÓA GHẾ: Ghế bị khóa (true) nếu:
            // - Đã nằm trong danh sách ghế đã đặt thành công (bookedSeatIds)
            // - HOẶC ghế đó bị admin đánh dấu bảo trì/hỏng (seat.getIsOccupied() == true)
            boolean isLocked = (seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId()))
                    || Boolean.TRUE.equals(seat.getIsOccupied());

            seatMap.put("isBooked", isLocked);

            return seatMap;
        }).collect(Collectors.toList());
    }
}