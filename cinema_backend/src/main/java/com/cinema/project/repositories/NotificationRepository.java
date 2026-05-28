package com.cinema.project.repositories;

import com.cinema.project.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Tìm kiếm và tự động sắp xếp theo biến cục bộ mang tính Java (createdAt) lên hàng đầu
    List<Notification> findAllByOrderByCreatedAtDesc();
}