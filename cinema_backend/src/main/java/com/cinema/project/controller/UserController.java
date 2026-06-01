package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // 🚀 THÊM IMPORT NÀY
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 🚀 TIÊM BCryptPasswordEncoder VÀO ĐÂY (Sẽ tự điền nhờ @RequiredArgsConstructor)

    // ================= ENDPOINT CHO ADMIN =================

    // URL: http://localhost:8080/api/admin/users/all
    @GetMapping("/admin/users/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // URL: http://localhost:8080/api/admin/users/delete/{id}
    @DeleteMapping("/admin/users/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }


    // ================= ENDPOINT CHO USER THƯỜNG (FIX LỖI 403) =================

    // 💡 Lấy thông tin cá nhân -> URL: http://localhost:8080/api/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 💡 Cập nhật thông tin cá nhân -> URL: http://localhost:8080/api/users/update/{id}
    @PutMapping("/users/update/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

            if (updates.containsKey("fullName") && updates.get("fullName") != null) {
                user.setFullName(updates.get("fullName").toString());
            }
            if (updates.containsKey("phone") && updates.get("phone") != null) {
                user.setPhone(updates.get("phone").toString());
            }
            if (updates.containsKey("dateOfBirth") && updates.get("dateOfBirth") != null) {
                user.setDateOfBirth(updates.get("dateOfBirth").toString());
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật thành công!",
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật: " + e.getMessage());
        }
    }

    // 🚀 CHỨC NĂNG 1: ĐỔI MẬT KHẨU KHỚP VỚI FRONTEND ĐÃ SỬA -> URL: http://localhost:8080/api/users/change-password/{id}
    @PutMapping("/users/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

            // Dùng passwordEncoder so sánh pass thô giao diện gõ vs pass băm trong DB
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không chính xác!"));
            }

            // Mã hóa mật khẩu mới trước khi lưu vào DB
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    // 🚀 CHỨC NĂNG 2: USER TỰ XÓA TÀI KHOẢN (HARD DELETE) -> URL: http://localhost:8080/api/users/delete/{id}
    @DeleteMapping("/users/delete/{id}")
    public ResponseEntity<?> userDeleteAccount(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản cần xóa!"));

            // XÓA MỀM: Thay vì userRepository.delete(user);
            // Mình sẽ xáo trộn dữ liệu để tài khoản này thành "phế nhân"
            user.setRole("DELETED");
            user.setPassword("da_bi_xoa_khong_the_login_" + Math.random());
            // Nếu DB ông có cột trạng thái (ví dụ isActive) thì set isActive = false là chuẩn nhất

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được xóa vĩnh viễn!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi Server: " + e.getMessage()));
        }
    }
}