package com.cinema.project.service;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Logic phân quyền tự động:
        if ("admin@gmail.com".equals(user.getEmail())) {
            user.setRole("ROLE_ADMIN");
        } else {
            user.setRole("ROLE_USER");
        }

        userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}