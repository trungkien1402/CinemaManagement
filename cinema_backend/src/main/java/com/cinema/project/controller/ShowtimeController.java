package com.cinema.project.controller;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.payload.response.SeatResponse;
import com.cinema.project.repositories.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ShowtimeController {

    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final VoucherRepository voucherRepository;

    public ShowtimeController(SeatRepository seatRepository, TicketRepository ticketRepository,
                              ShowtimeRepository showtimeRepository, MovieRepository movieRepository,
                              RoomRepository roomRepository, VoucherRepository voucherRepository) {
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.roomRepository = roomRepository;
        this.voucherRepository = voucherRepository;
    }

    // ==========================================
    // 1. CLIENT LỌC SUẤT CHIẾU THEO CỤM RẠP VÀ NGÀY
    // ==========================================
    @GetMapping("/showtimes/filter")
    public ResponseEntity<?> getShowtimesByFilter(@RequestParam String theaterId,
                                                  @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Showtime> allShowtimes = showtimeRepository.findAll();
        List<Showtime> filteredList;
        if ("all".equalsIgnoreCase(theaterId)) {
            filteredList = allShowtimes.stream()
                    .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date))
                    .collect(Collectors.toList());
        } else {
            filteredList = allShowtimes.stream()
                    .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date)
                            && st.getRoom() != null && st.getRoom().getTheater() != null
                            && theaterId.equalsIgnoreCase(st.getRoom().getTheater().getTheaterId()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(filteredList);
    }

    // ==========================================
    // 2. CLIENT LẤY SƠ ĐỒ GHẾ (ĐÃ FIX KHỚP THAM SỐ STRING)
    // ==========================================
    @GetMapping("/showtimes/{showtimeId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsForShowtime(@PathVariable String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu ứng với ID cung cấp!"));

        List<Seat> allSeats = seatRepository.findByRoom_RoomId(showtime.getRoom().getRoomId());

        // 🛠️ ĐÃ FIX: Truyền trực tiếp String showtimeId để khớp với TicketRepository mới sửa đổi
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        List<SeatResponse> response = allSeats.stream().map(seat -> {
            boolean isOccupied = seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId());
            return new SeatResponse(seat.getSeatId(), seat.getSeatNumber(), seat.getSeatType(), isOccupied);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 3. ADMIN LẤY TẤT CẢ DANH SÁCH SUẤT CHIẾU
    // ==========================================
    @GetMapping("/admin/showtimes/all")
    public ResponseEntity<?> getAllShowtimesForAdmin() {
        return ResponseEntity.ok(showtimeRepository.findAll());
    }

    // ==========================================
    // 4. ADMIN PHÁT HÀNH TẠO MỚI SUẤT CHIẾU
    // ==========================================
    @PostMapping("/admin/showtimes/create")
    public ResponseEntity<?> createShowtime(@RequestBody Map<String, Object> payload) {
        try {
            Showtime showtime = new Showtime();
            showtime.setShowtimeId("ST-" + (System.currentTimeMillis() % 100000L));

            Long movieId = Long.parseLong(payload.get("movieId").toString());
            String roomId = (String) payload.get("roomId");

            showtime.setMovie(movieRepository.findById(movieId).orElseThrow(() -> new RuntimeException("Không tìm thấy phim")));
            showtime.setRoom(roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng")));
            showtime.setShowDate(LocalDate.parse(payload.get("showDate").toString()));
            showtime.setStartTime(LocalTime.parse(payload.get("startTime").toString()));
            showtime.setTicketPrice(Double.parseDouble(payload.get("ticketPrice").toString()));

            return ResponseEntity.status(HttpStatus.CREATED).body(showtimeRepository.save(showtime));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo suất chiếu: " + e.getMessage());
        }
    }

    // ==========================================
    // 5. ADMIN LẤY BÁO CÁO THỐNG KÊ DOANH THU & BIỂU ĐỒ (ĐÃ FIX ĐỘNG 100%)
    // ==========================================
    @GetMapping("/admin/showtimes-dashboard/summary")
    public ResponseEntity<?> getAdminAnalyticsSummary() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalRevenue", ticketRepository.calculateTotalRevenue());
            stats.put("totalTickets", ticketRepository.countAllTickets());

            int currentYear = LocalDate.now().getYear();
            List<Object[]> rawMonthlyData = ticketRepository.findMonthlyRevenue(currentYear);
            List<Map<String, Object>> formattedMonthlyList = new ArrayList<>();
            for (Object[] row : rawMonthlyData) {
                if (row[0] != null && row[1] != null) {
                    Map<String, Object> monthMap = new HashMap<>();
                    monthMap.put("month", ((Number) row[0]).intValue());
                    monthMap.put("revenue", ((Number) row[1]).doubleValue());
                    formattedMonthlyList.add(monthMap);
                }
            }
            stats.put("monthlyData", formattedMonthlyList);

            List<Object[]> rawTopMovies = ticketRepository.findTopMovies();
            List<Map<String, Object>> topMoviesList = rawTopMovies.stream().map(row -> {
                Map<String, Object> movieMap = new HashMap<>();
                movieMap.put("title", row[0] != null ? row[0].toString() : "Phim ẩn danh");

                long ticketsSold = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                movieMap.put("ticketsSold", ticketsSold);

                // ✅ ĐÃ FIX ĐỘNG: Lấy dữ liệu tổng tiền thực tế từ row[2] của database trả về
                double revenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
                movieMap.put("revenue", revenue);

                return movieMap;
            }).collect(Collectors.toList());
            stats.put("topMovies", topMoviesList);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // ==========================================
    // 6. NHÓM CHỨC NĂNG QUẢN TRỊ VOUCHER KHUYẾN MÃI
    // ==========================================
    @GetMapping("/admin/vouchers/all")
    public ResponseEntity<?> getAllVouchers() {
        return ResponseEntity.ok(voucherRepository.findAll());
    }

    @PostMapping("/admin/vouchers/create")
    public ResponseEntity<?> createVoucher(@RequestBody com.cinema.project.model.Voucher voucher) {
        if (voucherRepository.existsById(voucher.getVoucherCode())) {
            return ResponseEntity.badRequest().body("Mã voucher đã tồn tại!");
        }
        voucher.setVoucherCode(voucher.getVoucherCode().toUpperCase().trim());
        return ResponseEntity.ok(voucherRepository.save(voucher));
    }

    @DeleteMapping("/admin/vouchers/delete/{code}")
    public ResponseEntity<?> deleteVoucher(@PathVariable String code) {
        voucherRepository.deleteById(code);
        return ResponseEntity.ok("Xóa voucher thành công!");
    }
}