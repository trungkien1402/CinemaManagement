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

            // 💡 SỬA LỖI: Chỉ kiểm tra xem admin đã tồn tại hay chưa, TUYỆT ĐỐI KHÔNG XÓA
            boolean adminExists = userRepository.findAll().stream()
                    .anyMatch(u -> adminEmail.equalsIgnoreCase(u.getEmail()));

            if (!adminExists) {
                // Nếu chưa có thì tạo mới
                User admin = new User();
                admin.setUsername("Administrator");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                admin.setPhone("0999999999");
                admin.setGender("Nam");

                userRepository.save(admin);
                System.out.println(">>> [SUCCESS] Khoi tao Admin voi ID tu dong thanh cong!");
            } else {
                // Nếu có rồi thì bỏ qua để bảo vệ dữ liệu cũ
                System.out.println(">>> [INFO] Tai khoan Admin da ton tai, bo qua khoi tao de bao ve du lieu (Khong bi loi xoa Foreign Key nua)!");
            }

        } catch (Exception e) {
            System.err.println(">>> [ERROR] Loi trong qua trinh khoi tao du lieu: " + e.getMessage());
        }
    }
}