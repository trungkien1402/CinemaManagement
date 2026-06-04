package com.cinema.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noti_id")
    private Long id;

    // 🚀 SỬA LẠI: Dùng NVARCHAR(255) chuẩn của SQL Server để lưu tiêu đề tiếng Việt
    @Column(name = "noti_title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    // 🚀 SỬA LẠI: Dùng NVARCHAR(MAX) chuẩn của SQL Server để lưu nội dung dài vô tư
    @Column(name = "noti_message", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @Column(name = "noti_is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "noti_created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "noti_type", length = 50)
    private String type;
}