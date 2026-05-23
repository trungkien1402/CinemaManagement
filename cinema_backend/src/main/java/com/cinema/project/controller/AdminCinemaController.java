package com.cinema.project.controller;

import com.cinema.project.payload.request.RoomCreationRequest;
import com.cinema.project.model.Room;
import com.cinema.project.model.Seat;
import com.cinema.project.model.Theater;
import com.cinema.project.repositories.RoomRepository;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.TheaterRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminCinemaController {

    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;

    // ==========================================
    // 1. QUẢN LÝ RẠP (THEATER)
    // ==========================================
    @GetMapping("/theaters/all")
    public ResponseEntity<?> getAllTheaters() {
        try {
            return ResponseEntity.ok(theaterRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/theaters/create")
    public ResponseEntity<?> createTheater(@RequestBody Theater theater) {
        if (theaterRepository.existsById(theater.getTheaterId())) {
            return ResponseEntity.badRequest().body("Mã cụm rạp này đã tồn tại trên hệ thống!");
        }
        return ResponseEntity.ok(theaterRepository.save(theater));
    }

    // ==========================================
    // 2. QUẢN LÝ PHÒNG & TỰ ĐỘNG SINH SƠ ĐỒ GHẾ
    // ==========================================
    @GetMapping("/rooms/theater/{theaterId}")
    public ResponseEntity<?> getRoomsByTheater(@PathVariable String theaterId) {
        return ResponseEntity.ok(roomRepository.findByTheaterTheaterId(theaterId));
    }

    @PostMapping("/rooms/create/{theaterId}")
    @Transactional
    public ResponseEntity<?> createRoomAndSeats(
            @PathVariable String theaterId,
            @RequestBody RoomCreationRequest dto
    ) {
        try {
            Theater theater = theaterRepository.findById(theaterId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy rạp chiếu chỉ định!"));

            if (roomRepository.existsById(dto.getRoomId())) {
                return ResponseEntity.badRequest().body("Mã phòng chiếu này đã tồn tại!");
            }

            // 1. Tạo và cấu hình thông tin phòng chiếu
            Room room = new Room();
            room.setRoomId(dto.getRoomId());
            room.setRoomNumber(dto.getRoomNumber());
            room.setTheater(theater);

            int totalSeats = dto.getRowsCount() * dto.getColsCount();
            room.setTotalSeats(totalSeats);
            roomRepository.save(room);

            // 2. Sử dụng mảng List để gom ghế và thực hiện Batch Insert (Tối ưu hóa tốc độ DB)
            List<Seat> seatList = new ArrayList<>();
            char rowLabel = 'A';

            for (int i = 0; i < dto.getRowsCount(); i++) {
                for (int j = 1; j <= dto.getColsCount(); j++) {
                    Seat seat = new Seat();

                    // Đồng bộ định dạng chuỗi: Đều sử dụng 2 chữ số (Ví dụ: Số ghế A01, ID ghế ROOM1-A01)
                    String formattedIndex = String.format("%02d", j);
                    String seatId = room.getRoomId() + "-" + rowLabel + formattedIndex;

                    seat.setSeatId(seatId);
                    seat.setSeatNumber(rowLabel + formattedIndex);

                    // Tự phân bổ loại ghế (Hàng 4 đến hàng 8 là VIP - Chỉ số mảng từ 3 đến 7)
                    if (i >= 3 && i <= 7) {
                        seat.setSeatType("VIP");
                    } else {
                        seat.setSeatType("NORMAL");
                    }

                    // Mặc định ban đầu ghế trống, hoạt động bình thường
                    seat.setIsOccupied(false);
                    seat.setRoom(room);

                    seatList.add(seat);
                }
                rowLabel++; // Chuyển sang hàng tiếp theo (A -> B -> C...)
            }

            // Lưu toàn bộ danh sách ghế bằng 1 câu lệnh duy nhất thay vì lặp lệnh SQL
            seatRepository.saveAll(seatList);

            return ResponseEntity.ok("Đã khởi tạo thành công phòng số " + dto.getRoomNumber() + " cùng sơ đồ " + totalSeats + " ghế!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi tạo phòng: " + e.getMessage());
        }
    }

    @DeleteMapping("/rooms/delete/{roomId}")
    @Transactional
    public ResponseEntity<?> deleteRoom(@PathVariable String roomId) {
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng cần xóa!"));

            // Giải phóng và xóa toàn bộ ghế thuộc phòng này trước để tránh lỗi ràng buộc FK
            List<Seat> seats = seatRepository.findByRoom_RoomId(roomId);
            seatRepository.deleteAll(seats);

            // Tiến hành xóa phòng
            roomRepository.delete(room);
            return ResponseEntity.ok("Xóa phòng chiếu và giải phóng cấu hình sơ đồ ghế thành công!");
        } catch (Exception e) {
            // Trường hợp phòng đã được xếp lịch chiếu phim ở bảng khác
            return ResponseEntity.badRequest().body("Không thể xóa phòng! Phòng chiếu này hiện đang có lịch chiếu phim (Showtime) đang hoạt động.");
        }
    }

    // ==========================================
    // 3. QUẢN LÝ TRẠNG THÁI GHẾ (BẢO TRÌ)
    // ==========================================
    @GetMapping("/seats/room/{roomId}")
    public ResponseEntity<?> getSeatsByRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(seatRepository.findByRoom_RoomId(roomId));
    }

    @PutMapping("/seats/toggle-status/{seatId}")
    public ResponseEntity<?> toggleSeatStatus(@PathVariable String seatId) {
        try {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu ghế!"));

            // Đảo ngược trạng thái khóa/mở ghế (Khớp với hành động click của Admin ở Frontend)
            seat.setIsOccupied(!seat.getIsOccupied());
            Seat updatedSeat = seatRepository.save(seat);

            return ResponseEntity.ok(updatedSeat);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }
}