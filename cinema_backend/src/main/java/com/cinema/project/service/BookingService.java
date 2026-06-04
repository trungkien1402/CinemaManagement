package com.cinema.project.service;

import com.cinema.project.payload.request.BookingRequest;
import com.cinema.project.model.*;
import com.cinema.project.repositories.*;
import com.cinema.project.service.NotificationService;

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
    private final NotificationService notificationService;

    // =========================================================================
    // CODE ĐẶT VÉ CHÍNH TÍCH HỢP ĐIỂM THƯỞNG
    // =========================================================================
    @Transactional
    public List<Ticket> processBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Suất chiếu"));

        // 🚀 BƯỚC 1: XỬ LÝ SỬ DỤNG ĐIỂM GIẢM GIÁ
        int pointsToUse = (request.getPointsToUse() != null) ? request.getPointsToUse() : 0;
        if (user.getPoints() == null) user.setPoints(0);

        if (user.getPoints() < pointsToUse) {
            throw new RuntimeException("Số điểm thưởng không đủ để thực hiện giao dịch!");
        }

        // 1 Điểm = 100 VNĐ. Chia đều mức giảm giá cho tổng số vé đang mua
        double totalDiscountAmount = pointsToUse * 100.0;
        double discountPerTicket = request.getSeatIds().isEmpty() ? 0 : totalDiscountAmount / request.getSeatIds().size();

        List<Ticket> savedTickets = new ArrayList<>();
        List<String> seatNames = new ArrayList<>();
        double grandTotalPaid = 0; // Biến tính tổng tiền thực tế khách đã trả

        for (String seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Ghế"));

            boolean exists = ticketRepository.existsByShowtimeAndSeat(showtime, seat);
            if (exists) {
                throw new RuntimeException("Ghế " + seat.getSeatNumber() + " đã được đặt!");
            }

            // 🚀 ĐÃ SỬA: Xóa cái basePrice 100k cũ đi. Gọi hàm tính giá vé chuẩn khớp 100% với Frontend!
            double ticketPrice = calculateSeatPrice(seat) - discountPerTicket;
            if (ticketPrice < 0) ticketPrice = 0; // Chống lỗi âm tiền

            grandTotalPaid += ticketPrice; // Cộng dồn để lát tính điểm thưởng

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
            seatNames.add(seat.getSeatNumber());
        }

        // 🚀 BƯỚC 2: TÍCH ĐIỂM SAU KHI MUA (Cộng lại 5% hóa đơn)
        int earnedPoints = (int) ((grandTotalPaid * 0.05) / 1000);

        // Cập nhật lại số điểm của khách (Điểm cũ - Điểm đã xài + Điểm mới nhận)
        user.setPoints(user.getPoints() - pointsToUse + earnedPoints);
        userRepository.save(user); // LƯU VÀO DATABASE

        // Tạo thông báo
        try {
            String movieTitle = showtime.getMovie() != null ? showtime.getMovie().getTitle() : "Phim";
            String seatsString = String.join(", ", seatNames);
            String pointMsg = (pointsToUse > 0 ? " (Đã dùng " + pointsToUse + " điểm)" : "") + ". Được cộng thêm " + earnedPoints + " điểm thưởng.";

            notificationService.createNotification(
                    "Đặt vé thành công 🎉",
                    "Khách hàng " + user.getUsername() + " đã mua vé '" + movieTitle + "' (Ghế: " + seatsString + ")" + pointMsg,
                    "BOOKING"
            );
        } catch (Exception e) {
            System.err.println("Gặp sự cố khi tạo thông báo: " + e.getMessage());
        }

        // Gửi Mail
        try {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                sendTicketEmailWithQR(user.getEmail(), savedTickets, showtime);
            }
        } catch (Exception e) {
            System.err.println("Lỗi gửi mail: " + e.getMessage());
        }

        return savedTickets;
    }

    // =========================================================================
    // CÁC HÀM ĐƯỢC CHUYỂN TỪ CONTROLLER VỀ
    // =========================================================================

    public List<String> getBookedSeats(String showtimeId) {
        return ticketRepository.findBookedSeatIdsByShowtime(showtimeId);
    }

    public List<Ticket> getBookingHistory(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    // =========================================================================
    // HÀM PHỤ TRỢ (PRIVATE HELPERS)
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

    // 🚀 ĐÃ SỬA: Hàm tính giá ghế đã được làm lại cho đồng bộ 100% với Frontend (React)
    private double calculateSeatPrice(Seat seat) {
        if (seat == null || seat.getSeatType() == null) return 30000;

        switch (seat.getSeatType().trim().toUpperCase()) {
            case "VIP":
                return 50000;
            case "DOUBLE":
            case "DOI":
                return 100000;
            default:
                return 30000;
        }
    }
}