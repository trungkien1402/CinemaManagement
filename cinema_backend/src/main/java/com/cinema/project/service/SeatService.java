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

    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    // ĐÃ SỬA: Đổi tham số đầu vào từ String sang Long showtimeId để đồng bộ với toàn hệ thống
    public List<Map<String, Object>> getSeatsStatusByShowtime(String showtimeId) {

        // 1. Tìm thông tin suất chiếu xem thuộc phòng nào
        // Lưu ý: Nếu showtimeRepository.findById nhận vào String, ta dùng showtimeId.toString() tại đây
        Showtime showtime = showtimeRepository.findById(showtimeId.toString())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        String roomId = showtime.getRoom().getRoomId();

        // 2. Lấy toàn bộ ghế vật lý cấu hình sẵn của phòng đó lên từ Database
        List<Seat> allSeats = seatRepository.findByRoom_RoomId(roomId);

        // 3. Khớp hoàn hảo với TicketRepository mới (Truyền vào Long showtimeId)
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        // 4. ĐỒNG BỘ & TỐI ƯU: Sử dụng Stream API thay cho vòng lặp for truyền thống để tạo cấu trúc JSON
        return allSeats.stream().map(seat -> {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("seatId", seat.getSeatId());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("seatType", seat.getSeatType());

            // Nếu mã ID ghế nằm trong danh sách vé đã thanh toán (COMPLETED), đánh dấu true để Frontend khóa ghế
            // Ngoài ra, kiểm tra thêm nếu ghế gốc bị Admin đánh dấu bảo trì (seat.getIsOccupied() == true) thì cũng khóa luôn
            boolean isLocked = (seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId()))
                    || Boolean.TRUE.equals(seat.getIsOccupied());

            seatMap.put("isBooked", isLocked);

            return seatMap;
        }).collect(Collectors.toList());
    }
}