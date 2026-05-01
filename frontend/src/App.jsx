import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import MovieCard from './components/shared/MovieCard';
import Home from './components/home/Home';
import NowShowing from './components/home/NowShowing';
import MovieSchedule from './components/home/MovieSchedule';


function App() {
  const listMovies = [
    {
      id: 1,
      title: "Bóng Đêm Huyền Bí",
      genre: "Hành động, Phiêu lưu",
      rating: 8.5,
      duration: 142,
      image: "https://tse2.mm.bing.net/th/id/OIP._NO16bHpajT640nmHhgeoAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" // Thay link ảnh thật vào đây
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
    <Router> 
      <div className="app-container">
        
        <Navbar /> 
        
        
        <main className="main-content">
          <Routes>
           
           <Route path="/" element={<Home />} />
           <Route path="/dang-chieu" element={<NowShowing />} />
           <Route path="/lich-chieu" element={<MovieSchedule />} />
          </Routes>
        </main>

        <Footer /> 
        
      </div>
    </Router>
  );
}

export default App;