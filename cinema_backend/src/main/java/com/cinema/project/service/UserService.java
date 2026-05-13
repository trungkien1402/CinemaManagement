package com.cinema.project.service;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if ("admin@gmail.com".equals(user.getEmail())) {
            user.setRole("ROLE_ADMIN");
        } else {
            user.setRole("ROLE_USER");
        }
        userRepository.save(user);
    }

    public User login(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);


        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }


    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}