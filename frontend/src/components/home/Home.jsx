import '../style/Home.css';
import React, { memo, useEffect, useState } from 'react';
import HeroSlider from './slider/HeroSlider';
import MovieCard from '../shared/MovieCard';
import SectionHeader from '../shared/SectionHeader';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMovie } from '../../store/movieSlice';

const Home = () => {
    const dispatch = useDispatch();
    const { listMovies, loading } = useSelector((state) => state.movies);

    // State quản lý vị trí bắt đầu của cụm 4 phim
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        dispatch(fetchMovie());
    }, [dispatch]);

    // Tự động lướt sang cụm 4 phim kế tiếp sau mỗi 5 giây
    useEffect(() => {
        if (!listMovies || listMovies.length <= 4) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                // Nếu lướt hết danh sách phim thì quay lại từ đầu (Vòng lặp)
                if (prevIndex + 4 >= listMovies.length) {
                    return 0;
                }
                return prevIndex + 4;
            });
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(interval);
    }, [listMovies]);

    if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Đang tải phim...</div>;

    // Cắt mảng lấy đúng 4 bộ phim để hiển thị theo currentIndex hiện tại
    const visibleMovies = listMovies ? listMovies.slice(currentIndex, currentIndex + 4) : [];

    return (
        <div className="home-page">
            <HeroSlider movies={listMovies} />

            <div className="content-container">
                {/* Click Xem Tất Cả sẽ nhảy sang tab /dang-chieu để xem toàn bộ kho phim */}
                <SectionHeader
                    title="Phim Đang Chiếu"
                    subtitle="Những bộ phim đang hot nhất hiện nay"
                    linkTo="/dang-chieu"
                />

                {/* Grid hiển thị 4 phim kèm key hiệu ứng đổi trang mượt mà */}
                <div className="movie-grid" key={currentIndex} style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    {visibleMovies.map((movie) => (
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