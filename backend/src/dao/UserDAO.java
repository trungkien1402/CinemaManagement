package dao;

import java.util.List;
import entity.User;

public class UserDAO implements BaseDAO<User> {

    @Override
    public List<User> findAll() {
        return List.of();
    }

    @Override
    public User findById(String id) {
        return null;
    }

    @Override
    public boolean add(User obj) {
        return false;
    }

    @Override
    public boolean update(User obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
