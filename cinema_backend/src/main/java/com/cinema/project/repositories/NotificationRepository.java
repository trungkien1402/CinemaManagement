package com.cinema.project.repositories;

import com.cinema.project.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();


    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.read = false")
    int markAllAsReadByCustomQuery();
}