package com.cinema.project.service;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.ShowtimeRepository;
import com.cinema.project.repositories.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
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

    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    public List<Map<String, Object>> getSeatsStatusByShowtime(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        String roomId = showtime.getRoom().getRoomId();
        List<Seat> allSeats = seatRepository.findByRoom_RoomId(roomId);
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        Date now = new Date(); // Lấy thời gian hiện tại kiểu Date

        return allSeats.stream().map(seat -> {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("seatId", seat.getSeatId());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("seatType", seat.getSeatType());

            // 🛠️ Dùng hàm .after() của java.util.Date để check hết hạn
            boolean isLocked = (seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId()))
                    || Boolean.TRUE.equals(seat.getIsOccupied())
                    || (seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().after(now));

            seatMap.put("isBooked", isLocked);
            return seatMap;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void holdSeats(List<String> seatIds) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        Date now = new Date();

        for (Seat seat : seats) {
            if (Boolean.TRUE.equals(seat.getIsOccupied())) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã được bán!");
            }
            // 🛠️ Dùng hàm .after() để kiểm tra trùng ghế trùng lịch giữ tạm
            if (seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().after(now)) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã có người nhanh tay chọn trước!");
            }
        }

        // 🛠️ Cộng thêm 10 phút (10 * 60 * 1000 mili-giây) theo kiểu Date chuẩn
        Date expiresAt = new Date(System.currentTimeMillis() + 10 * 60 * 1000);
        for (Seat seat : seats) {
            seat.setHoldExpiresAt(expiresAt);
        }

        seatRepository.saveAll(seats);
    }

    @Transactional
    public void releaseSeats(List<String> seatIds) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        for (Seat seat : seats) {
            seat.setHoldExpiresAt(null);
        }
        seatRepository.saveAll(seats);
    }
}