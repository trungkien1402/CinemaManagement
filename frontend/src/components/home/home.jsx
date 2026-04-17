import React from 'react';
import MovieCard from '../shared/MovieCard.jsx'; 
import './Home.css';

const Home = () => {
 
  const listMovies = [
    {
      id: 1,
      title: "Bóng Đêm Huyền Bí",
      genre: "Hành động, Phiêu lưu",
      rating: 8.5,
      duration: 142,
      image: "https://tse2.mm.bing.net/th/id/OIP._NO16bHpajT640nmHhgeoAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
    },
    {
      id: 2,
      title: "Kẻ Hủy Diệt",
      genre: "Khoa học viễn tưởng",
      rating: 9.0,
      duration: 120,
      image: ""
    }
  ];

  return (
    <div class=" content">
        {listMovies.map((item) => (
            
            <MovieCard key={item.id} movie={item} />
        ))}
    </div>
        
    
    
    
  );
};

export default Home;