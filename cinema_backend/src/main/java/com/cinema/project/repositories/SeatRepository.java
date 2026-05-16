package com.cinema.project.repositories;

import com.cinema.project.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {

    // GIỮ LẠI ĐÚNG HÀM NÀY, XÓA HÀM CŨ ĐI
    List<Seat> findByRoom_RoomId(String roomId);

}