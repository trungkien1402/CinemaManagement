package com.cinema.project.repositories;

import com.cinema.project.model.MovieFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieFavoriteRepository extends JpaRepository<MovieFavorite, Long> {
    List<MovieFavorite> findByUser_UserId(Long userId);
    Optional<MovieFavorite> findByUser_UserIdAndMovie_MovieId(Long userId, Long movieId);
    boolean existsByUser_UserIdAndMovie_MovieId(Long userId, Long movieId);
    List<MovieFavorite> findByMovie_MovieId(Long movieId);
}
