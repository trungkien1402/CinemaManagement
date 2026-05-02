package dao;

import java.util.List;

public interface BaseDAO<T> {
    List<T> findAll();

    T findById(String id);

    boolean add(T obj);

    boolean update(T obj);

    boolean delete(String id);
}