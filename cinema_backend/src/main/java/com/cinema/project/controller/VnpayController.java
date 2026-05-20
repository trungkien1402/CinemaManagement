package com.cinema.project.controller;

import com.cinema.project.config.VnpayConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API không bị lỗi CORS
public class VnpayController {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String secretKey;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> requestData) {
        try {
            // Lấy tổng tiền từ Frontend gửi lên (Ép về kiểu số nguyên dứt khoát)
            long amountRaw = Long.parseLong(requestData.get("totalPrice").toString());
            long amount = amountRaw * 100; // VNPay yêu cầu nhân 100 để triệt tiêu số thập phân

            // Tạo mã giao dịch ngẫu nhiên tránh trùng lặp phiên cũ
            String txnRef = String.valueOf(System.currentTimeMillis());
            String ipAddr = "127.0.0.1";

            // Định dạng thời gian chuẩn ISO VNPay
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String createDate = formatter.format(cld.getTime());

            // Dùng TreeMap để tự động sắp xếp tham số từ A-Z theo bảng chữ cái (Bắt buộc)
            Map<String, String> vnp_Params = new TreeMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", tmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", txnRef);
            vnp_Params.put("vnp_OrderInfo", "ThanhToanVeXemPhim");
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_IpAddr", ipAddr);
            vnp_Params.put("vnp_CreateDate", createDate);

            // Nối chuỗi dữ liệu gốc (hashData) và chuỗi Query URL công khai
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = vnp_Params.entrySet().iterator();

            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();

                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // 1. Mã hóa chuẩn URLEncoder theo UTF-8 thay vì US_ASCII
                    String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                    // 2. ÉP CHUẨN IN HOA: Đổi dấu '+' thành '%20' và viết hoa các ký tự mã hóa đặc biệt (VD: %3a thành %3A)
                    encodedFieldName = encodedFieldName.replace("+", "%20");
                    encodedFieldValue = encodedFieldValue.replace("+", "%20");

                    encodedFieldName = fixUrlEncodedCase(encodedFieldName);
                    encodedFieldValue = fixUrlEncodedCase(encodedFieldValue);

                    // 3. Nối chuỗi dữ liệu băm bảo mật (Không được encode FIELD NAME, chỉ encode FIELD VALUE)
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(encodedFieldValue);

                    // 4. Nối chuỗi đẩy lên URL trình duyệt
                    query.append(encodedFieldName);
                    query.append('=');
                    query.append(encodedFieldValue);

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            // Sinh mã băm chữ ký bảo mật dựa trên Secret Key chính chủ của bạn
            String queryUrl = query.toString();
            String vnp_SecureHash = VnpayConfig.hmacSHA512(secretKey, hashData.toString());

            // Cấu trúc URL hoàn chỉnh cuối cùng
            String paymentUrl = payUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

            // Trả link về cho Frontend React điều hướng ổn định
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xử lý tạo link VNPay: " + e.getMessage());
        }
    }

    // Hàm bổ trợ ép ký tự mã hóa URL thành chữ IN HOA chuẩn mã nguồn VNPay 2.1.0
    private String fixUrlEncodedCase(String input) {
        char[] chars = input.toCharArray();
        for (int i = 0; i < chars.length - 2; i++) {
            if (chars[i] == '%') {
                chars[i + 1] = Character.toUpperCase(chars[i + 1]);
                chars[i + 2] = Character.toUpperCase(chars[i + 2]);
            }
        }
        return new String(chars);
    }
}