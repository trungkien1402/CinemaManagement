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
import java.util.Arrays; // bổ sung thư viện này để xử lý dấu phẩy
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
    private final MovieFavoriteRepository movieFavoriteRepository;
    private final NotificationService notificationService;

    // ==============================================================================
    // 1. dạy backend cách hiểu nhiều id rạp cùng lúc (vd: "r01,r02,r03")
    // ==============================================================================
    public List<Showtime> getShowtimesByFilter(String theaterId, LocalDate date) {
        // Trường hợp 1: Chọn Tất cả, không phân biệt tỉnh
        if (theaterId == null || theaterId.trim().isEmpty() || "all".equalsIgnoreCase(theaterId.trim())) {
            return showtimeRepository.findByShowDate(date);
        }

        // Trường hợp 2: Gửi danh sách các rạp thuộc 1 tỉnh (Có chứa dấu phẩy)
        if (theaterId.contains(",")) {
            List<String> ids = Arrays.asList(theaterId.split(","));
            return showtimeRepository.findByShowDate(date).stream()
                    .filter(st -> st.getRoom() != null && st.getRoom().getTheater() != null
                            && ids.contains(st.getRoom().getTheater().getTheaterId()))
                    .collect(Collectors.toList());
        }

        // Trường hợp 3: Chọn đúng 1 rạp cụ thể
        return showtimeRepository.findByRoom_Theater_TheaterIdAndShowDate(theaterId, date);
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

    // 4. Admin tạo mới suất chiếu
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

        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Gửi thông báo đến những người dùng yêu thích phim này
        try {
            var movie = savedShowtime.getMovie();

            // Gửi thông báo chung cho toàn hệ thống
            String globalTitle = "Lịch chiếu mới: " + movie.getTitle() + " 🍿";
            String globalMessage = "Phim \"" + movie.getTitle() + "\" đã có suất chiếu mới vào ngày " 
                + savedShowtime.getShowDate() + " lúc " + savedShowtime.getStartTime() + ". Đặt vé ngay!";
            notificationService.createNotification(globalTitle, globalMessage, "MOVIE");

            var favorites = movieFavoriteRepository.findByMovie_MovieId(movieId);
            for (var fav : favorites) {
                String title = "Suất chiếu mới cho phim: " + movie.getTitle() + " 🍿";
                String message = "Phim \"" + movie.getTitle() + "\" bạn yêu thích đã có suất chiếu mới vào ngày " 
                    + savedShowtime.getShowDate() + " lúc " + savedShowtime.getStartTime() 
                    + " tại " + (savedShowtime.getRoom() != null && savedShowtime.getRoom().getTheater() != null ? savedShowtime.getRoom().getTheater().getName() : "rạp") 
                    + " (Phòng " + (savedShowtime.getRoom() != null ? savedShowtime.getRoom().getRoomNumber() : "") + ").";
                notificationService.createNotificationForUser(title, message, "MOVIE", fav.getUser().getUserId());
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo thông báo cho người dùng yêu thích phim: " + e.getMessage());
        }

        return savedShowtime;
    }

    // 5. Admin lấy báo cáo thống kê doanh thu & biểu đồ
    public Map<String, Object> getAdminAnalyticsSummary() {
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
            movieMap.put("ticketsSold", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            movieMap.put("revenue", row[2] != null ? ((Number) row[2]).doubleValue() : 0.0);
            return movieMap;
        }).collect(Collectors.toList());
        stats.put("topMovies", topMoviesList);

        return stats;
    }
}