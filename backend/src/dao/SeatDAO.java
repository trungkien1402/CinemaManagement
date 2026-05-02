package dao;

import entity.Seat;

import java.util.List;

public class SeatDAO implements BaseDAO<Seat>{

    @Override
    public List<Seat> findAll() {
        return List.of();
    }

    @Override
    public Seat findById(String id) {
        return null;
    }

    @Override
    public boolean add(Seat obj) {
        return false;
    }

    @Override
    public boolean update(Seat obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
