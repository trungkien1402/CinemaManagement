package com.cinema.project.repositories;

import com.cinema.project.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, String> {

    List<Showtime> findByRoom_Theater_TheaterIdAndShowDate(String theaterId, LocalDate showDate);
    List<Showtime> findByShowDate(LocalDate showDate);
}