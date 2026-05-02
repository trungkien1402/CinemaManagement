package dao;

import entity.Ticket;

import java.util.List;

public class TicketDAO implements BaseDAO<Ticket>{

    @Override
    public List<Ticket> findAll() {
        return List.of();
    }

    @Override
    public Ticket findById(String id) {
        return null;
    }

    @Override
    public boolean add(Ticket obj) {
        return false;
    }

    @Override
    public boolean update(Ticket obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
