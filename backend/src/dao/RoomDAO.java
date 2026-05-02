package dao;

import entity.Room;

import java.util.List;

public class RoomDAO implements BaseDAO<Room>{

    @Override
    public List<Room> findAll() {
        return List.of();
    }

    @Override
    public Room findById(String id) {
        return null;
    }

    @Override
    public boolean add(Room obj) {
        return false;
    }

    @Override
    public boolean update(Room obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
