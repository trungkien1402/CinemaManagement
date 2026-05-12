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

/**
 * COMPONENT BẢO VỆ ROUTE
 * Kiểm tra quyền ROLE_ADMIN từ Redux Store
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Nếu chưa đăng nhập hoặc không phải Admin, đá về trang chủ
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Component phụ để ẩn Navbar/Footer khi ở trang Admin
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  // Nếu đường dẫn bắt đầu bằng /admin, chúng ta sẽ ẩn Navbar và Footer trang chủ
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

          {/* --- ADMIN ROUTES (Riêng biệt hoàn toàn) --- */}
          <Route 
            path="/admin" 
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