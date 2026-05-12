import MovieCard from '../shared/MovieCard';
import './stylepage/NowShowing.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';
import React, { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = () => {
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

        useEffect(() => {
            dispatch(fetchMovie()); 
        }, [dispatch]);

    const comingSoon= listMovies.filter(movie=> movie.status ===0);

        if (loading) return <div>Đang tải phim...</div>;
        console.log("Dữ liệu phim nè:", listMovies);
    return (
        <div className="section-header-nowshowing">
            <h2 className="title-nowshowing"> Phim Đang Chiếu  </h2>
           
            <div className="movie-grid">
                      {comingSoon.map((movie) => (
                        <MovieCard key={movie.movieId} movie={movie} />
                      ))}
            </div>
        </div>
    );
    
};
export default ComingSoon;