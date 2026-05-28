package com.cinema.project.service;

import com.cinema.project.model.Notification;
import com.cinema.project.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Lấy toàn bộ danh sách thông báo mới nhất xếp lên đầu
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    // Hàm tạo nhanh thông báo từ các logic tính năng khác
    public void createNotification(String title, String message, String type) {
        Notification noti = new Notification();
        noti.setTitle(title);
        noti.setMessage(message);
        noti.setType(type);
        noti.setCreatedAt(LocalDateTime.now());
        noti.setRead(false);
        notificationRepository.save(noti);
    }

    // Đánh dấu toàn bộ thông báo trong hệ thống là đã đọc
    public void markAllAsRead() {
        List<Notification> list = notificationRepository.findAll();
        list.forEach(noti -> noti.setRead(true));
        notificationRepository.saveAll(list);
    }
}