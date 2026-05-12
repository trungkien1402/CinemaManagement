package com.cinema.project.repositories;

import com.cinema.project.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // SỬA Ở ĐÂY: Đổi String status thành int status
    List<Movie> findByStatus(int status);

}