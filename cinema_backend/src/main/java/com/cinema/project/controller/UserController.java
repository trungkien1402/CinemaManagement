package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/admin/users/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/admin/users/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @PutMapping("/users/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không chính xác!"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/delete/{id}")
    public ResponseEntity<?> userDeleteAccount(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản cần xóa!"));

            user.setRole("DELETED");
            user.setPassword("da_bi_xoa_khong_the_login_" + Math.random());

            long timestamp = System.currentTimeMillis();
            user.setEmail("deleted_" + timestamp + "_" + user.getEmail());
            user.setUsername("deleted_" + timestamp + "_" + user.getUsername());

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được xóa vĩnh viễn!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi Server: " + e.getMessage()));
        }
    }

    // 🚀 API UPDATE AVATAR DÙNG JSON BASE64
    @PutMapping("/users/update-avatar/{id}")
    public ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            // Hứng chuỗi Base64 từ React gửi lên
            String base64Image = request.get("avatarUrl");

            if (base64Image == null || base64Image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ảnh không hợp lệ!"));
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

            // Lưu trực tiếp vào DB
            user.setAvatarUrl(base64Image);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật ảnh đại diện thành công!",
                    "avatarUrl", base64Image
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi lưu ảnh: " + e.getMessage()));
        }
    }
}