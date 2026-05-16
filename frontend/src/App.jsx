import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Home from './components/home/Home';
import NowShowing from './components/home/NowShowing';
import ComingSoon from './components/home/ComingSoon';
import MovieSchedule from './components/home/MovieSchedule';
import AdminDashboard from './components/admin/AdminDashboard';
import SeatSelection from './components/seat/seat';

// 💡 IMPORT MODAL TOÀN CẦU
import GlobalBookingModal from './components/shared/GlobalBookingModal';

// 💡 IMPORT TRANG HỆ THỐNG RẠP MỚI VÀO ĐÂY
import Theaters from './components/theater/Theaters';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdminPage && <Navbar />}

      {/* ĐẶT MODAL Ở ĐÂY ĐỂ NÓ SỐNG TRƯỜNG SINH BẤT LÃO */}
      <GlobalBookingModal />

      <main className={isAdminPage ? "admin-content-full" : "main-content"}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* --- CÁC TRANG DÀNH CHO KHÁCH HÀNG --- */}
          <Route path="/" element={<Home />} />
          <Route path="/dang-chieu" element={<NowShowing />} />
          <Route path="/sap-chieu" element={<ComingSoon />} />
          <Route path="/lich-chieu" element={<MovieSchedule />} />
          <Route path="/dat-ve/:showtimeId" element={<SeatSelection />} />

          {/* 💡 THÊM ĐƯỜNG DẪN ĐẾN TRANG RẠP TẠI ĐÂY */}
          <Route path="/rap" element={<Theaters />} />

          {/* --- TRANG QUẢN TRỊ ADMIN --- */}
          <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;