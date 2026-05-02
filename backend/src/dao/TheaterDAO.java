package dao;

import entity.Theater;

import java.util.List;

public class TheaterDAO implements BaseDAO<Theater>{

    @Override
    public List<Theater> findAll() {
        return List.of();
    }

    @Override
    public Theater findById(String id) {
        return null;
    }

    @Override
    public boolean add(Theater obj) {
        return false;
    }

    @Override
    public boolean update(Theater obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
