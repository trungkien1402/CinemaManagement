package com.cinema.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Hàm gửi OTP dùng cho ĐĂNG KÝ
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("CinemaX <your-email@gmail.com>");
        message.setTo(toEmail);
        message.setSubject("MÃ XÁC THỰC ĐĂNG KÝ TÀI KHOẢN - CINEMAX");
        message.setText("Chào bạn,\n\n"
                + "Mã xác thực (OTP) của bạn là: " + otp + "\n"
                + "Mã này có hiệu lực trong vòng 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nĐội ngũ CinemaX.");

        mailSender.send(message);
    }

    // hàm mới: gửi otp dùng cho quên mật khẩu
    public void sendForgotPasswordEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("CinemaX <your-email@gmail.com>");
        message.setTo(toEmail);
        message.setSubject("MÃ OTP KHÔI PHỤC MẬT KHẨU - CINEMAX");
        message.setText("Chào bạn,\n\n"
                + "Mã OTP để khôi phục mật khẩu của bạn là: " + otp + "\n"
                + "Mã này sẽ hết hạn trong vòng 5 phút.\n"
                + "Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Trân trọng,\nĐội ngũ CinemaX.");

        mailSender.send(message);
    }
}