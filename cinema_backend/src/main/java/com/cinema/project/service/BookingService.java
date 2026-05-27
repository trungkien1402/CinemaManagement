package com.cinema.project.service;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.*;
import com.cinema.project.repositories.*;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final JavaMailSender mailSender;

    // =========================================================================
    // CODE ĐẶT VÉ CHÍNH (Đã được giữ nguyên logic cốt lõi của bạn)
    // =========================================================================
    @Transactional
    public List<Ticket> processBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Suất chiếu"));

        List<Ticket> savedTickets = new ArrayList<>();

        for (String seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Ghế"));

            // Kiểm tra trùng ghế song song (Bảo vệ dữ liệu thời gian thực)
            boolean exists = ticketRepository.existsByShowtimeAndSeat(showtime, seat);
            if (exists) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã được đặt!");
            }

            double ticketPrice = calculateSeatPrice(seat);

            Ticket ticket = new Ticket();
            String randomTicketId = "TK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            ticket.setTicketId(randomTicketId);
            ticket.setUser(user);
            ticket.setShowtime(showtime);
            ticket.setSeat(seat);
            ticket.setTotalPrice(ticketPrice);
            ticket.setStatusTk(0);
            ticket.setBookingDate(LocalDateTime.now());

            savedTickets.add(ticketRepository.save(ticket));
        }

        // Tự động gửi Email kèm mã QR
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                sendTicketEmailWithQR(user.getEmail(), savedTickets, showtime);
            }
        } catch (Exception e) {
            System.err.println("Gặp sự cố khi gửi email mã QR: " + e.getMessage());
            e.printStackTrace();
        }

        return savedTickets;
    }

    // =========================================================================
    // CÁC HÀM ĐƯỢC CHUYỂN TỪ CONTROLLER VỀ (Đúng chuẩn kiến trúc)
    // =========================================================================

    // Lấy danh sách ID ghế đã khóa theo suất chiếu
    public List<String> getBookedSeats(String showtimeId) {
        return ticketRepository.findBookedSeatIdsByShowtime(showtimeId);
    }

    // Lấy lịch sử đặt vé của một khách hàng
    public List<Ticket> getBookingHistory(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    // =========================================================================
    // HÀM PHỤ TRỢ (PRIVATE HELPERS) - CHỈ DÙNG NỘI BỘ TRONG SERVICE
    // =========================================================================

    // =========================================================================
    // HÀM PHỤ TRỢ (PRIVATE HELPERS) - CHỈ DÙNG NỘI BỘ TRONG SERVICE
    // =========================================================================

    private void sendTicketEmailWithQR(String toEmail, List<Ticket> tickets, Showtime showtime) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("🍿 [Cinema] Vé xem phim điện tử và Mã QR nhận vé 🍿");

        StringBuilder ticketListHtml = new StringBuilder();
        StringBuilder qrContentText = new StringBuilder(); // Khởi tạo builder chứa mã QR
        double grandTotal = 0;

        String movieTitle = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "Phim đã chọn";
        String dateString = showtime.getShowDate() != null ? showtime.getShowDate().toString() : "";
        String timeString = showtime.getStartTime() != null ? showtime.getStartTime().toString() : "";

        for (int i = 0; i < tickets.size(); i++) {
            Ticket ticket = tickets.get(i);
            String seatDisplay = ticket.getSeat() != null ? ticket.getSeat().getSeatNumber() : ticket.getSeat().getSeatId();

            // 1. Tạo HTML hiển thị trên Email
            ticketListHtml.append("<li style='margin-bottom: 8px;'>")
                    .append("🎫 <strong>Mã Vé:</strong> <span style='color: #ffcc00; font-weight: bold;'>").append(ticket.getTicketId()).append("</span>")
                    .append(" | 💺 <strong>Ghế:</strong> ").append(seatDisplay)
                    .append("</li>");

            // 2. CHỈ THÊM MÃ VÉ VÀO NỘI DUNG QR
            qrContentText.append(ticket.getTicketId());
            if (i < tickets.size() - 1) {
                qrContentText.append(", "); // Cách nhau bằng dấu phẩy nếu mua nhiều vé (Hoặc dùng "\n" nếu muốn xuống dòng)
            }

            grandTotal += ticket.getTotalPrice();
        }

        // Tạo ảnh QR từ nội dung chỉ chứa mã vé
        byte[] qrCodeImage = generateQRCodeImage(qrContentText.toString(), 250, 250);

        String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;'>"
                + "  <h2 style='color: #28a745; text-align: center;'>🎉 ĐẶT VÉ THÀNH CÔNG! 🎉</h2>"
                + "  <p>Chào bạn, thông tin đặt vé xem phim của bạn đã được xác nhận thành công trên hệ thống:</p>"
                + "  <div style='background-color: #f8f9fa; border-left: 4px solid #ffcc00; padding: 12px; margin: 15px 0;'>"
                + "    <p style='margin: 4px 0;'>🎬 <strong>Phim:</strong> <span style='font-size: 16px; color: #c82333; font-weight: bold;'>" + movieTitle + "</span></p>"
                + "    <p style='margin: 4px 0;'>🗓️ <strong>Ngày chiếu:</strong> " + dateString + "</p>"
                + "    <p style='margin: 4px 0;'>🕒 <strong>Suất chiếu:</strong> " + timeString + "</p>"
                + "  </div>"
                + "  <h4 style='color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;'>DANH SÁCH GHẾ:</h4>"
                + "  <ul style='list-style: none; padding-left: 0;'>" + ticketListHtml.toString() + "</ul>"
                + "  <h3 style='color: #28a745;'>💰 Tổng số tiền: " + String.format("%,.0f", grandTotal) + " VNĐ</h3>"
                + "  <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>"
                + "  <div style='text-align: center; margin: 20px 0;'>"
                + "    <p style='font-weight: bold; color: #555;'>MÃ QR NHẬN VÉ TẠI QUẦY:</p>"
                + "    <img src='cid:qrCodeImageInline' alt='Mã QR Vé Xem Phim' style='border: 2px solid #333; padding: 5px; border-radius: 5px;' />"
                + "  </div>"
                + "  <p style='font-size: 12px; color: #777; text-align: center;'>Vui lòng đưa mã QR này cho nhân viên soát vé tại rạp để in vé giấy vào phòng chiếu nhanh nhất.</p>"
                + "</div>";

        helper.setText(htmlBody, true);
        helper.addInline("qrCodeImageInline", new ByteArrayResource(qrCodeImage), "image/png");

        mailSender.send(message);
    }

    private byte[] generateQRCodeImage(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        }
    }

    private double calculateSeatPrice(Seat seat) {
        if (seat.getSeatType() == null) return 30000;
        switch (seat.getSeatType().toUpperCase()) {
            case "VIP": return 50000;
            case "DOI": return 100000;
            default: return 30000;
        }
    }
}