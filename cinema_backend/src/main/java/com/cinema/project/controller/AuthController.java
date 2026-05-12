package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.service.EmailService;
import com.cinema.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
@RequiredArgsConstructor
public class AuthController {

    private final EmailService emailService;
    private final UserService userService;
    private Map<String, String> otpCache = new ConcurrentHashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) return ResponseEntity.badRequest().body("Email không được trống!");

        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email này đã được đăng ký!");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpCache.put(email, otp);

        try {
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok("Mã OTP đã được gửi đến email của bạn.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi gửi mail: " + e.getMessage());
        }
    }

    @PostMapping("/register-with-otp")
    public ResponseEntity<?> registerWithOtp(@RequestBody Map<String, Object> request) {
        String email = String.valueOf(request.get("email"));
        String otpInput = String.valueOf(request.get("otp"));
        String savedOtp = otpCache.get(email);

        if (savedOtp == null || !savedOtp.equals(otpInput)) {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác hoặc đã hết hạn!");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(String.valueOf(request.get("password")));
        user.setUsername(String.valueOf(request.get("username")));
        user.setPhone(String.valueOf(request.get("phone")));
        user.setGender(String.valueOf(request.get("gender")));

        userService.registerNewUser(user);
        otpCache.remove(email);
        return ResponseEntity.ok("Đăng ký tài khoản thành công!");
    }
}