package com.cinema.project.controller;

import com.cinema.project.model.Notification;
import com.cinema.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cho phép Frontend kết nối API không bị lỗi CORS
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        log.info("Yêu cầu lấy toàn bộ danh sách thông báo hệ thống.");
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }


    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> readAll() {
        log.info("Yêu cầu đánh dấu đã đọc toàn bộ thông báo.");

        notificationService.markAllAsRead();


        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã đánh dấu đọc toàn bộ thông báo thành công!"
        ));
    }
}