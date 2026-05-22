package com.cinema.project.service;

import com.cinema.project.repositories.TicketRepository;
import com.cinema.project.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TicketRepository ticketRepository;
    private final MovieRepository movieRepository;

    public Map<String, Object> getAdminDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // 1. Lấy tổng doanh thu
        Double totalRevenue = ticketRepository.calculateTotalRevenue();

        // 2. Lấy tổng số vé đã bán
        Long totalTickets = ticketRepository.countAllTickets();

        // 3. Lấy tổng số phim đang có trong hệ thống
        Long totalMovies = movieRepository.count();

        summary.put("totalRevenue", totalRevenue);
        summary.put("totalTickets", totalTickets);
        summary.put("totalMovies", totalMovies);

        return summary;
    }
}