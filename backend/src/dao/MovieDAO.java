package dao;

import config.ConnectionDatabase;
import entity.Movie;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MovieDAO implements BaseDAO<Movie>{

    @Override
    public List<Movie> findAll() {
        List<Movie> list = new ArrayList<>();
        String sql = "SELECT * FROM movies";
        try (Connection cn = ConnectionDatabase.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Movie m = new Movie();
                m.setMovieId(rs.getString("movie_id"));
                m.setTitle(rs.getString("title"));
                m.setStatus(rs.getInt("status"));
                m.setDescription(rs.getString("description"));
                m.setDuration(rs.getInt("duration"));
                m.setGenre(rs.getString("genre"));
                m.setAgeRating(rs.getString("age_rating"));
                m.setReleaseDate(rs.getDate("release_date"));
                m.setImage(rs.getString("image"));
                m.setAuthor(rs.getString("author"));
                list.add(m);
            }
        } catch (SQLException e) {
            // cho biet loi cu the
            e.printStackTrace();
        }
        return list;
    }

    @Override
    public Movie findById(String id) {
        String sql = "SELECT * FROM movies WHERE movie_id = ?";
        try (Connection cn = ConnectionDatabase.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Movie m = new Movie();
                    m.setMovieId(rs.getString("movie_id"));
                    m.setTitle(rs.getString("title"));
                    m.setStatus(rs.getInt("status"));
                    m.setDescription(rs.getString("description"));
                    m.setDuration(rs.getInt("duration"));
                    m.setGenre(rs.getString("genre"));
                    m.setAgeRating(rs.getString("age_rating"));
                    m.setReleaseDate(rs.getDate("release_date"));
                    m.setImage(rs.getString("image"));
                    m.setAuthor(rs.getString("author"));
                    return m;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public boolean add(Movie obj) {
        String sql = "INSERT INTO movies (movie_id, title, status, description, duration, genre, age_rating, release_date, image, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection cn = ConnectionDatabase.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, obj.getMovieId());
            ps.setString(2, obj.getTitle());
            ps.setInt(3, obj.getStatus());
            ps.setString(4, obj.getDescription());
            ps.setInt(5, obj.getDuration());
            ps.setString(6, obj.getGenre());
            ps.setString(7, obj.getAgeRating());
            ps.setDate(8, obj.getReleaseDate());
            ps.setString(9, obj.getImage());
            ps.setString(10, obj.getAuthor());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean update(Movie obj) {
        String sql = "UPDATE movies SET title=?, status=?, description=?, duration=?, genre=?, age_rating=?, release_date=?, image=?, author=? WHERE movie_id=?";
        try (Connection cn = ConnectionDatabase.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, obj.getTitle());
            ps.setInt(2, obj.getStatus());
            ps.setString(3, obj.getDescription());
            ps.setInt(4, obj.getDuration());
            ps.setString(5, obj.getGenre());
            ps.setString(6, obj.getAgeRating());
            ps.setDate(7, obj.getReleaseDate());
            ps.setString(8, obj.getImage());
            ps.setString(9, obj.getAuthor());
            ps.setString(10, obj.getMovieId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean delete(String id) {
        String sql = "DELETE FROM movies WHERE movie_id = ?";
        try (Connection cn = ConnectionDatabase.getConnection();
             PreparedStatement ps = cn.prepareStatement(sql)) {

            ps.setString(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
