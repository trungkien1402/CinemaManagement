package com.cinema.project.service;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.*;
import com.cinema.project.repositories.*;
import com.cinema.project.service.NotificationService; // Tích hợp Service thông báo

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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final JavaMailSender mailSender;

    // TÍCH HỢP: Khai báo final để @RequiredArgsConstructor tự động inject
    private final NotificationService notificationService;

    // =========================================================================
    // CODE ĐẶT VÉ CHÍNH (Đã tích hợp thông báo chuyên nghiệp)
    // =========================================================================
    @Transactional
    public List<Ticket> processBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Suất chiếu"));

        List<Ticket> savedTickets = new ArrayList<>();
        List<String> seatNames = new ArrayList<>(); // Dùng để gom tên ghế tạo thông báo

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
            seatNames.add(seat.getSeatNumber()); // Lưu lại số ghế (ví dụ: A1, A2)
        }

        // TÍCH HỢP: Tự động bắn thông báo real-time lên hệ thống khi đặt vé thành công
        try {
            String movieTitle = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "Phim";
            String seatsString = String.join(", ", seatNames);

            notificationService.createNotification(
                    "Đặt vé và thành công 🎉",
                    "Khách hàng " + user.getUsername() + " đã đặt và thành công vé phim '" + movieTitle + "' (Ghế: " + seatsString + ").",
                    "BOOKING"
            );
        } catch (Exception e) {
            System.err.println("Gặp sự cố khi tạo thông báo đặt vé: " + e.getMessage());
        }

        // Tự động gửi Email kèm mã QR
        // Tự động gửi Email kèm mã QR
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                // 1. Gọi hàm gửi email cũ của bạn
                sendTicketEmailWithQR(user.getEmail(), savedTickets, showtime);

                // 2. CHÈN THÊM THÔNG BÁO NÀY: Báo tin gửi mã thành công lên Navbar
                String movieTitle = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "Phim";
                notificationService.createNotification(
                        "Đã gửi mã vé thành công ✉️",
                        "Hệ thống đã gửi email chứa mã QR vé phim '" + movieTitle + "' đến địa chỉ: " + user.getEmail(),
                        "EMAIL" // Loại EMAIL để sau này bạn thích cấu hình hiển thị icon hòm thư ở React
                );
            }
        } catch (Exception e) {
            System.err.println("Gặp sự cố khi gửi email mã QR: " + e.getMessage());
            e.printStackTrace();

            // (Tùy chọn) Bạn có thể bắn thông báo thất bại nếu muốn Admin kiểm tra hệ thống mail
            notificationService.createNotification(
                    "Gửi mã vé thất bại ⚠️",
                    "Hệ thống gặp sự cố khi gửi email vé phim đến " + user.getEmail() + ". Lỗi: " + e.getMessage(),
                    "ERROR"
            );
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

    private void sendTicketEmailWithQR(String toEmail, List<Ticket> tickets, Showtime showtime) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("🍿 [Cinema] Vé xem phim điện tử và Mã QR nhận vé 🍿");

        StringBuilder ticketListHtml = new StringBuilder();
        StringBuilder qrContentText = new StringBuilder();
        double grandTotal = 0;

        String movieTitle = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "Phim đã chọn";
        String dateString = showtime.getShowDate() != null ? showtime.getShowDate().toString() : "";
        String timeString = showtime.getStartTime() != null ? showtime.getStartTime().toString() : "";

        for (int i = 0; i < tickets.size(); i++) {
            Ticket ticket = tickets.get(i);
            String seatDisplay = ticket.getSeat() != null ? ticket.getSeat().getSeatNumber() : ticket.getSeat().getSeatId();

            ticketListHtml.append("<li style='margin-bottom: 8px;'>")
                    .append("🎫 <strong>Mã Vé:</strong> <span style='color: #ffcc00; font-weight: bold;'>").append(ticket.getTicketId()).append("</span>")
                    .append(" | 💺 <strong>Ghế:</strong> ").append(seatDisplay)
                    .append("</li>");

            qrContentText.append(ticket.getTicketId());
            if (i < tickets.size() - 1) {
                qrContentText.append(", ");
            }

            grandTotal += ticket.getTotalPrice();
        }

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