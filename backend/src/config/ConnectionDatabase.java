package config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectionDatabase {

    private static final String URL = "jdbc:sqlserver://localhost:1437;databaseName=CNMDATABASES;encrypt=true;trustServerCertificate=true;";
    private static final String USER = "sa";
    private static final String PASSWORD = "29062006";

    public static Connection getConnection() {
        Connection cn = null;
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

            cn = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("Connect thành công!");

        } catch (ClassNotFoundException e) {
            System.out.println("Không tìm thấy thư viện JDBC. Hãy kiểm tra lại phần External Libraries.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("Kết nối SQL Server thất bại. Kiểm tra URL, Username, Password hoặc Port.");
            e.printStackTrace();
        }
        return cn;
    }

    public static void main(String[] args) {
        getConnection();
    }
}