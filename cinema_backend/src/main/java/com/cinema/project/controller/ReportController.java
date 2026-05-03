package com.cinema.project.controller;

import com.cinema.project.repositories.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/revenue")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepo;
    @GetMapping("/daily")
    public Map<String, Object> getDailyRevenue(@RequestParam String date) {
        Map<String, Object> res = new HashMap<>();
        res.put("date", date);
        // Gọi hàm từ ReportRepository thay vì MovieRepository
        res.put("totalRevenue", reportRepo.getRevenueByDate(date));
        res.put("status", "success");
        return res;
    }

    @GetMapping("/movies")
    public List<Map<String, Object>> getMovieRevenue() {
        // Chuyển việc gọi hàm getRevenueByMovie sang reportRepo để đúng module
        return reportRepo.getRevenueByMovie();
    }
}