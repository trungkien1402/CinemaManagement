package com.cinema.project.service;

import com.cinema.project.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;

    public Map<String, Object> login(String username, String password) {
        return userRepo.checkLogin(username, password);
    }

    public boolean registerUser(Map<String, String> data) {
        return userRepo.register(
                data.get("username"),
                data.get("password"),
                data.get("email"),
                data.get("phone"),
                data.get("gender")
        );
    }
}