package dao;

import entity.Report;

import java.util.List;

public class ReportDAO implements BaseDAO<Report>{


    @Override
    public List<Report> findAll() {
        return List.of();
    }

    @Override
    public Report findById(String id) {
        return null;
    }

    @Override
    public boolean add(Report obj) {
        return false;
    }

    @Override
    public boolean update(Report obj) {
        return false;
    }

    @Override
    public boolean delete(String id) {
        return false;
    }
}
