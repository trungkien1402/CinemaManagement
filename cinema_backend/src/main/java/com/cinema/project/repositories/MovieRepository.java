package com.cinema.project.repositories;

import com.cinema.project.model.Movie;
import com.cinema.project.config.ConnectionDatabase;
import org.springframework.stereotype.Repository;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MovieRepository {

    public List<Movie> findByStatus(int status) {
        List<Movie> movies = new ArrayList<>();
        String sql = "SELECT * FROM movies WHERE status = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, status);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Movie movie = new Movie();
                movie.setMovieId(rs.getString("movie_id"));
                movie.setTitle(rs.getString("title"));
                movie.setStatus(rs.getInt("status"));
                movie.setDescription(rs.getString("description"));
                movie.setDuration(rs.getInt("duration"));
                movie.setGenre(rs.getString("genre"));
                movie.setAgeRating(rs.getString("age_rating"));
                if (rs.getDate("release_date") != null) movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                movies.add(movie);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return movies;
    }

    public Movie findById(String id) {
        String sql = "SELECT * FROM movies WHERE movie_id = ?";
        try (Connection conn = ConnectionDatabase.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                Movie movie = new Movie();
                movie.setMovieId(rs.getString("movie_id"));
                movie.setTitle(rs.getString("title"));
                movie.setStatus(rs.getInt("status"));
                movie.setDescription(rs.getString("description"));
                movie.setDuration(rs.getInt("duration"));
                movie.setGenre(rs.getString("genre"));
                movie.setAgeRating(rs.getString("age_rating"));
                if (rs.getDate("release_date") != null) movie.setReleaseDate(rs.getDate("release_date").toLocalDate());
                movie.setImage(rs.getString("image"));
                movie.setAuthor(rs.getString("author"));
                return movie;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }
}