package com.cinema.project.config;

import com.cinema.project.model.User;
import com.cinema.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            String adminEmail = "admin@gmail.com";


            userRepository.findAll().stream()
                    .filter(u -> adminEmail.equalsIgnoreCase(u.getEmail()))
                    .findFirst()
                    .ifPresent(user -> userRepository.delete(user));


            User admin = new User();
            admin.setUsername("Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setPhone("0999999999");
            admin.setGender("Nam");

            userRepository.save(admin);
            System.out.println(">>> [SUCCESS] Khoi tao Admin voi ID tu dong!");
        } catch (Exception e) {
            System.err.println(">>> [INFO] Co the Admin da ton tai: " + e.getMessage());
        }
    }
}