package com.cinema.project.service;

import com.cinema.project.model.Movie;
import com.cinema.project.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    // 1. Lấy phim theo status
    public List<Movie> getMoviesByStatus(int status) {
        return movieRepository.findByStatus(status);
    }

    // 2. Lấy toàn bộ phim
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // 3. Lấy chi tiết phim theo id
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    // 4. Tìm kiếm phim
    public List<Movie> searchMoviesByTitle(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return movieRepository.findByTitleContainingIgnoreCase(keyword.trim());
    }

    // =====================================================================
    // dùng đường dẫn tuyệt đối để lưu chính xác vào thư mục project
    // =====================================================================
    public String saveFile(MultipartFile file, String folderName) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // Ép đường dẫn chui vào đúng cinema_backend
        String rootPath = System.getProperty("user.dir");
        Path uploadPath;
        if (rootPath.endsWith("cinema_backend")) {
            uploadPath = Paths.get(rootPath, "uploads", folderName);
        } else {
            uploadPath = Paths.get(rootPath, "cinema_backend", "uploads", folderName);
        }

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // tên tiếng việt/khoảng trắng
        String originalName = file.getOriginalFilename();
        // Lấy đúng cái đuôi .png hoặc .jpg
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".png";

        // Ghép thời gian + đuôi file (VD: 1780841471770.png)
        String fileName = System.currentTimeMillis() + extension;

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + folderName + "/" + fileName;
    }

    // Hàm phụ trợ lưu phim (Dùng chung cho tạo mới và cập nhật)
    public Movie saveMovieObj(Movie movie) {
        return movieRepository.save(movie);
    }
}