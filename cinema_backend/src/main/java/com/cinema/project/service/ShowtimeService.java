package com.cinema.project.service;

import com.cinema.project.model.Seat;
import com.cinema.project.model.Showtime;
import com.cinema.project.payload.response.SeatResponse;
import com.cinema.project.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;

    // 1. Logic lọc suất chiếu theo cụm rạp và ngày cho Client
    public List<Showtime> getShowtimesByFilter(String theaterId, LocalDate date) {
        List<Showtime> allShowtimes = showtimeRepository.findAll();

        if ("all".equalsIgnoreCase(theaterId)) {
            return allShowtimes.stream()
                    .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date))
                    .collect(Collectors.toList());
        } else {
            return allShowtimes.stream()
                    .filter(st -> st.getShowDate() != null && st.getShowDate().equals(date)
                            && st.getRoom() != null && st.getRoom().getTheater() != null
                            && theaterId.equalsIgnoreCase(st.getRoom().getTheater().getTheaterId()))
                    .collect(Collectors.toList());
        }
    }

    // 2. Logic lấy sơ đồ ghế và ánh xạ sang SeatResponse cho Client
    public List<SeatResponse> getSeatsForShowtime(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu ứng với ID cung cấp!"));

        List<Seat> allSeats = seatRepository.findByRoom_RoomId(showtime.getRoom().getRoomId());
        List<String> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtime(showtimeId);

        return allSeats.stream().map(seat -> {
            boolean isOccupied = seat.getSeatId() != null && bookedSeatIds.contains(seat.getSeatId());
            return new SeatResponse(seat.getSeatId(), seat.getSeatNumber(), seat.getSeatType(), isOccupied);
        }).collect(Collectors.toList());
    }

    // 3. Admin lấy tất cả suất chiếu
    public List<Showtime> getAllShowtimes() {
        return showtimeRepository.findAll();
    }

    // 4. Admin tạo mới suất chiếu (Xử lý bóc tách payload)
    @Transactional
    public Showtime createShowtime(Map<String, Object> payload) {
        Showtime showtime = new Showtime();
        showtime.setShowtimeId("ST-" + (System.currentTimeMillis() % 100000L));

        Long movieId = Long.parseLong(payload.get("movieId").toString());
        String roomId = (String) payload.get("roomId");

        showtime.setMovie(movieRepository.findById(movieId).orElseThrow(() -> new RuntimeException("Không tìm thấy phim")));
        showtime.setRoom(roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng")));
        showtime.setShowDate(LocalDate.parse(payload.get("showDate").toString()));
        showtime.setStartTime(LocalTime.parse(payload.get("startTime").toString()));
        showtime.setTicketPrice(Double.parseDouble(payload.get("ticketPrice").toString()));

        return showtimeRepository.save(showtime);
    }

    // 5. Admin lấy báo cáo thống kê doanh thu & biểu đồ tổng quan
    public Map<String, Object> getAdminAnalyticsSummary() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", ticketRepository.calculateTotalRevenue());
        stats.put("totalTickets", ticketRepository.countAllTickets());

        // Lấy dữ liệu doanh thu theo từng tháng của năm hiện tại
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

        // Lấy dữ liệu danh sách phim ăn khách nhất
        List<Object[]> rawTopMovies = ticketRepository.findTopMovies();
        List<Map<String, Object>> topMoviesList = rawTopMovies.stream().map(row -> {
            Map<String, Object> movieMap = new HashMap<>();
            movieMap.put("title", row[0] != null ? row[0].toString() : "Phim ẩn danh");

            long ticketsSold = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            movieMap.put("ticketsSold", ticketsSold);

            double revenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            movieMap.put("revenue", revenue);

            return movieMap;
        }).collect(Collectors.toList());
        stats.put("topMovies", topMoviesList);

        return stats;
    }
    // ==========================================
    // 6. CLIENT LẤY CHI TIẾT 1 SUẤT CHIẾU THEO ID (MỚI THÊM)
    // ==========================================
    public Showtime findById(String showtimeId) {
        return showtimeRepository.findById(showtimeId).orElse(null);
    }
}