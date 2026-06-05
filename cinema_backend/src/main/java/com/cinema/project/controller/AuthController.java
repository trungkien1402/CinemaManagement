package com.cinema.project.controller;

import com.cinema.project.model.User;
import com.cinema.project.security.jwt.JwtUtils;
import com.cinema.project.service.EmailService;
import com.cinema.project.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.OPTIONS
        }
)
@RequiredArgsConstructor
public class AuthController {

    private final EmailService emailService;
    private final UserService userService;

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    private Map<String, String> otpCache =
            new ConcurrentHashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email không được trống!");
        }

        if (userService.existsByEmail(email)) {
            return ResponseEntity
                    .badRequest()
                    .body("Email này đã được đăng ký!");
        }

        String otp =
                String.format(
                        "%06d",
                        new Random().nextInt(999999)
                );

        otpCache.put(email, otp);

        try {

            emailService.sendOtpEmail(email, otp);

            return ResponseEntity.ok(
                    "Mã OTP đã được gửi đến email của bạn."
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(500)
                    .body("Lỗi gửi mail: " + e.getMessage());
        }
    }

    @PostMapping("/register-with-otp")
    public ResponseEntity<?> registerWithOtp(
            @RequestBody Map<String, Object> request
    ) {

        String email =
                String.valueOf(request.get("email"));

        String otpInput =
                String.valueOf(request.get("otp"));

        String savedOtp =
                otpCache.get(email);

        if (
                savedOtp == null ||
                        !savedOtp.equals(otpInput)
        ) {

            return ResponseEntity
                    .badRequest()
                    .body("Mã OTP không chính xác hoặc đã hết hạn!");
        }

        User user = new User();

        user.setEmail(email);

        user.setPassword(
                String.valueOf(request.get("password"))
        );

        user.setUsername(
                String.valueOf(request.get("username"))
        );

        user.setPhone(
                String.valueOf(request.get("phone"))
        );

        user.setGender(
                String.valueOf(request.get("gender"))
        );

        userService.registerNewUser(user);

        otpCache.remove(email);

        return ResponseEntity.ok(
                "Đăng ký tài khoản thành công!"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");
        String password = request.get("password");

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                password
                        )
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        String jwt =
                jwtUtils.generateJwtToken(authentication);

        User user =
                userService.login(email, password);

        if (user == null) {

            return ResponseEntity
                    .status(401)
                    .body("Email hoặc mật khẩu không chính xác!");
        }

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", jwt);

        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("gender", user.getGender());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}