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
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/dang-chieu" element={<NowShowing />} />
          <Route path="/sap-chieu" element={<ComingSoon />} />
          <Route path="/lich-chieu" element={<MovieSchedule />} />

          {/* Route cho trang đặt vé (Đã tối ưu, bỏ /:roomId thừa) */}
          <Route path="/dat-ve/:showtimeId" element={<SeatSelection />} />

          {/* --- ADMIN ROUTES (Riêng biệt hoàn toàn) --- */}
          <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

          {/* --- CATCH ALL --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;