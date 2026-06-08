package com.cinema.project.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin(origins = "*")
public class FileController {

    @GetMapping("/uploads/{folder}/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String folder, @PathVariable String fileName) {
        try {
            String rootPath = System.getProperty("user.dir");

            // dò tìm ở cả 2 thư mục (trong và ngoài cinema_backend)
            Path path1 = Paths.get(rootPath, "uploads", folder, fileName);
            Path path2 = Paths.get(rootPath, "cinema_backend", "uploads", folder, fileName);

            Path filePath;
            if (Files.exists(path2)) {
                filePath = path2; // Thấy file ở nhà mới thì lôi ra
            } else {
                filePath = path1; // Không thấy thì tìm ở nhà cũ
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                // In ra chi tiết để lỡ có lỗi tui còn bắt bài được
                System.out.println("❌ TÌM NÁT NƯỚC VẪN KHÔNG THẤY! Đã rà soát 2 nơi:");
                System.out.println("1. " + path1.toAbsolutePath());
                System.out.println("2. " + path2.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}