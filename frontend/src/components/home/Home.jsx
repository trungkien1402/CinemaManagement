import './stylepage/Home.css';
import React, { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from './slider/HeroSlider';
import MovieCard from '../shared/MovieCard';
import SectionHeader from '../shared/SectionHeader';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';


const Home = () => {
    const dispatch = useDispatch();
        const { listMovies, loading } = useSelector((state) => state.movies);
        useEffect(() => {
            dispatch(fetchMovie()); 
        }, [dispatch]);

        if (loading) return <div>Đang tải phim...</div>;
        console.log("Dữ liệu phim nè:", listMovies);

  return (
    <div className="home-page">
      <HeroSlider movies={listMovies} />
      
      <div className="content-container">
        <SectionHeader 
          title="Phim Đang Chiếu" 
          subtitle="Những bộ phim đang hot nhất hiện nay" 
          linkTo="/dang-chieu" 
        />

        <div className="movie-grid">
          {listMovies?.map((movie) => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>

        <SectionHeader 
          title="Phim Sắp Chiếu" 
          subtitle="Những bộ phim đang hot nhất hiện nay" 
          linkTo="/sap-chieu" 
        />
      </div>
    </div>
  );
};

export default memo(Home);