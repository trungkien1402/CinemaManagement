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

    // 1. Lấy tất cả ghế vật lý theo mã phòng (Cấu hình Admin)
    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    // 2. Lấy trạng thái khóa/mở ghế theo suất chiếu phục vụ Client đặt vé
    public List<Map<String, Object>> getSeatsStatusByShowtime(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        String roomId = showtime.getRoom().getRoomId();

        // 🛠️ Ép làm mới context để lấy dữ liệu thời gian thực từ SQL Server
        seatRepository.flush();

        List<Seat> allSeats = seatRepository.findByRoom_RoomId(roomId);
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        Date now = new Date(); // Lấy thời gian hiện tại kiểu Date

        return allSeats.stream().map(seat -> {
            Map<String, Object> seatMap = new HashMap<>();
            seatMap.put("seatId", seat.getSeatId());
            seatMap.put("seatNumber", seat.getSeatNumber());
            seatMap.put("seatType", seat.getSeatType());

            // LOGIC KHÓA GHẾ: Ghế bị khóa (true) nếu đã thanh toán, admin bảo trì, hoặc đang trong lịch giữ tạm
            boolean isLocked = (seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId()))
                    || Boolean.TRUE.equals(seat.getIsOccupied())
                    || (seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().after(now));

            seatMap.put("isBooked", isLocked);
            return seatMap;
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 🛠️ LOGIC: GIỮ GHẾ TẠM THỜI TRONG 10 PHÚT (CÓ ÉP FLUSH ĐỂ CHẶN TRANH CHẤP)
    // =========================================================================
    @Transactional
    public void holdSeats(List<String> seatIds) {
        // 🛠️ Ép ghi nhận/đồng bộ các giao dịch trước đó xuống DB
        seatRepository.flush();

        List<Seat> seats = seatRepository.findAllById(seatIds);
        Date now = new Date();

        for (Seat seat : seats) {
            if (Boolean.TRUE.equals(seat.getIsOccupied())) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã được bán!");
            }
            // Kiểm tra lịch giữ tạm, nếu thời gian hết hạn nằm ở tương lai (after now) -> CHẶN NGAY
            if (seat.getHoldExpiresAt() != null && seat.getHoldExpiresAt().after(now)) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã có người nhanh tay chọn trước!");
            }
        }

        // Đạt điều kiện trống hoàn toàn -> Tiến hành khóa tạm 10 phút
        Date expiresAt = new Date(System.currentTimeMillis() + 10 * 60 * 1000);
        for (Seat seat : seats) {
            seat.setHoldExpiresAt(expiresAt);
        }

        seatRepository.saveAll(seats);

        // 🛠️ Ép ghi đè mốc thời gian khóa xuống SQL Server ngay lập tức
        // Điều này đảm bảo Trình duyệt 2 khi gọi check sẽ dính lỗi chặn ngay lập tức
        seatRepository.flush();
    }

    // =========================================================================
    // 🛠️ LOGIC: GIẢI PHÓNG GHẾ (ROLLBACK) KHI KHÁCH HỦY HOẶC GIAO DỊCH LỖI
    // =========================================================================
    @Transactional
    public void releaseSeats(List<String> seatIds) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        for (Seat seat : seats) {
            seat.setHoldExpiresAt(null);
        }
        seatRepository.saveAll(seats);
        seatRepository.flush();
    }
}