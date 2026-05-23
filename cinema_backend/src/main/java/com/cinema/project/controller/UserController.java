package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 💡 CỰC KỲ QUAN TRỌNG: Mở cửa cho ReactJS gọi API mà không bị trình duyệt block (Lỗi CORS)
public class UserController {

    private final UserRepository userRepository;

    // API này giờ sẽ phục vụ cho cả Admin và Dropdown ở trang Bình Luận
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // API xóa user giữ nguyên của bạn
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(
                    Map.of("message", "Xóa thành công")
            );
        }).orElse(ResponseEntity.notFound().build());
    }
}