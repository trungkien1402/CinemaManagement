package com.cinema.project.controller;

import com.cinema.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> data) {
        Map<String, Object> user = userService.login(data.get("username"), data.get("password"));
        if (user != null) return user;
        Map<String, Object> err = new HashMap<>();
        err.put("message", "Sai tài khoản hoặc mật khẩu!");
        return err;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> data) {
        Map<String, String> res = new HashMap<>();
        if (userService.registerUser(data)) {
            res.put("status", "success");
        } else {
            res.put("status", "error");
        }
        return res;
    }
}