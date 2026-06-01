package com.cinema.project.controller;

import com.cinema.project.model.Notification;
import com.cinema.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> readAll() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok("Đã đọc tất cả thông báo");
    }
}