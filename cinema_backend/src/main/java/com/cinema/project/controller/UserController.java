package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api") // 💡 Thay đổi thành /api để linh hoạt phân quyền admin/user
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

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
}