package com.cinema.project.service;

import com.cinema.project.model.Notification;
import com.cinema.project.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void createNotification(String title, String message, String type) {
        try {
            Notification noti = new Notification();
            noti.setTitle(title);
            noti.setMessage(message);
            noti.setType(type);
            noti.setCreatedAt(LocalDateTime.now());
            noti.setRead(false);

            notificationRepository.save(noti);
            log.info("Tạo thông báo thành công: [{}] - Loại: {}", title, type);


        } catch (Exception e) {
            log.error("Gặp sự cố khi lưu thông báo vào database: ", e);
            throw new RuntimeException("Không thể tạo thông báo: " + e.getMessage());
        }
    }


    @Transactional
    public void markAllAsRead() {
        try {
            int updatedCount = notificationRepository.markAllAsReadByCustomQuery();
            log.info("Đã đánh dấu đã đọc cho toàn bộ thông báo thành công. Số lượng ảnh hưởng: {}", updatedCount);
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện cập nhật trạng thái đã đọc: ", e);
            throw new RuntimeException("Cập nhật trạng thái thông báo thất bại!");
        }
    }
}