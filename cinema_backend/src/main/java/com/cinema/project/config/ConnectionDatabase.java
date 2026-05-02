package com.cinema.project.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectionDatabase {

    private static final String URL = "jdbc:postgresql://localhost:5440/postgres";
    private static final String USER = "postgres";
    private static final String PASS = "";

    public static Connection getConnection() {
        try {
            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(URL, USER, PASS);
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Lỗi kết nối: " + e.getMessage());
            return null;
        }
    }
}