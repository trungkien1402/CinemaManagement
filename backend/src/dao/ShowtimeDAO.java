package dao;

import entity.Showtime;

import java.util.List;

public class ShowtimeDAO implements BaseDAO<Showtime>{

    @Override
    public List<Showtime> findAll() {
        return List.of();
    }

    @Override
    public Showtime findById(String id) {
        return null;
    }

    @Override
    public boolean add(Showtime obj) {
        return false;
    }

    @Override
    public boolean update(Showtime obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
