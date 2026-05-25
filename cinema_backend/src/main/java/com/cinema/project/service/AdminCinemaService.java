package com.cinema.project.service;

import com.cinema.project.model.Room;
import com.cinema.project.model.Seat;
import com.cinema.project.model.Theater;
import com.cinema.project.payload.request.RoomCreationRequest;
import com.cinema.project.repositories.RoomRepository;
import com.cinema.project.repositories.SeatRepository;
import com.cinema.project.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCinemaService {

    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;

    // 1. Logic thêm cụm rạp mới
    public Theater createTheater(Theater theater) {
        if (theaterRepository.existsById(theater.getTheaterId())) {
            throw new IllegalArgumentException("Mã rạp chiếu này đã tồn tại!");
        }
        if (theater.getCity() == null) theater.setCity("Chưa cập nhật");
        if (theater.getOperatingHours() == null) theater.setOperatingHours("08:00 - 23:30");

        return theaterRepository.save(theater);
    }

    // 2. Logic lấy tất cả cụm rạp
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    // 3. Logic khởi tạo phòng và sơ đồ ghế tự động
    @Transactional
    public String createRoomAndSeats(String theaterId, RoomCreationRequest dto) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new IllegalArgumentException("Lỗi: Không tìm thấy rạp chiếu!"));

        String systemRoomId = theaterId + "-" + dto.getRoomId().trim();

        if (roomRepository.existsById(systemRoomId)) {
            throw new IllegalArgumentException("Mã phòng này đã tồn tại trong cụm rạp này rồi!");
        }

        Room room = new Room();
        room.setRoomId(systemRoomId);
        room.setRoomNumber(dto.getRoomNumber().trim());
        room.setTheater(theater);

        int rows = (dto.getRowsCount() != null) ? dto.getRowsCount() : 8;
        int cols = (dto.getColsCount() != null) ? dto.getColsCount() : 10;
        int totalSeats = rows * cols;
        room.setTotalSeats(totalSeats);

        roomRepository.save(room);

        List<Seat> seatList = new ArrayList<>();
        char rowLabel = 'A';

        for (int i = 0; i < rows; i++) {
            for (int j = 1; j <= cols; j++) {
                Seat seat = new Seat();
                String formattedIndex = String.format("%02d", j);

                String shortRoomId = theaterId.replace("-", "") + dto.getRoomId().trim().replace("-", "");
                String seatId = shortRoomId + rowLabel + formattedIndex;

                seat.setSeatId(seatId);
                seat.setSeatNumber(rowLabel + formattedIndex);
                seat.setSeatType("NORMAL");
                seat.setIsOccupied(false);
                seat.setRoom(room);

                seatList.add(seat);
            }
            rowLabel++;
        }

        seatRepository.saveAll(seatList);
        return "Khởi tạo thành công " + room.getRoomNumber() + " thuộc " + theater.getName() + " với " + totalSeats + " ghế!";
    }

    // 4. Logic lấy danh sách phòng thuộc một rạp cụ thể
    public List<Room> getRoomsByTheater(String theaterId) {
        return roomRepository.findByTheaterTheaterId(theaterId);
    }

    // 5. Logic lấy danh sách ghế theo ID phòng
    public List<Seat> getSeatsByRoom(String roomId) {
        return seatRepository.findByRoom_RoomId(roomId);
    }

    // 6. Logic đổi loại ghế dạng xoay vòng
    @Transactional
    public Seat changeSeatType(String seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu ghế!"));

        String currentType = seat.getSeatType() != null ? seat.getSeatType().toUpperCase() : "NORMAL";

        switch (currentType) {
            case "NORMAL": seat.setSeatType("VIP"); break;
            case "VIP": seat.setSeatType("DOUBLE"); break;
            case "DOUBLE": default: seat.setSeatType("NORMAL"); break;
        }

        return seatRepository.save(seat);
    }
}