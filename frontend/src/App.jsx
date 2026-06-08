import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { useSelector } from 'react-redux';

import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';

import Home from './components/home/Home';
import NowShowing from './components/home/NowShowing';
import ComingSoon from './components/home/ComingSoon';
import MovieSchedule from './components/home/MovieSchedule';
import NewsPage from './components/home/NewsPage';

import AdminDashboard from './components/admin/AdminDashboard';

import SeatSelection from './components/seat/SeatSelection';

import ChatBox from './components/chatbox/ChatBox';
import UserProfile from './components/user/UserProfile';





// import trang chi tiết phim mới vào đây
import MovieDetail from './components/movie/MovieDetail';


import GlobalBookingModal from './components/shared/GlobalBookingModal';

import Theaters from './components/theater/Theaters';

import PaymentSuccess from './components/payment/PaymentSuccess';
import BookingHistory from './components/ticket/BookingHistory';


// ================= PROTECTED ROUTE =================
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);


  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};


// ================= LAYOUT =================
const LayoutWrapper = ({ children }) => {

  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith('/admin');

  return (
    <div className="app-container">

      {/* NAVBAR */}
      {!isAdminPage && <Navbar />}

      {/* CHATBOX */}
      <ChatBox />

      {/* MODAL */}
      <GlobalBookingModal />

      {/* CONTENT */}
      <main
        className={
          isAdminPage
            ? "admin-content-full"
            : "main-content"
        }
      >
        {children}
      </main>

      {/* FOOTER */}
      {!isAdminPage && <Footer />}

    </div>
  );
};


// ================= APP =================
function App() {

  return (
    <Router>

      <LayoutWrapper>

        <Routes>

          {/* ================= USER ================= */}

          <Route path="/" element={<Home />} />

          <Route
            path="/ho-so"
            element={<UserProfile />}
          />

          <Route
            path="/dang-chieu"
            element={<NowShowing />}
          />

          <Route
            path="/sap-chieu"
            element={<ComingSoon />}
          />

          <Route
            path="/lich-chieu"
            element={<MovieSchedule />}
          />

          <Route
            path="/dat-ve/:showtimeId"
            element={<SeatSelection />}
          />

          <Route
            path="/tin-tuc"
            element={<NewsPage />}
          />

          <Route
            path="/rap"
            element={<Theaters />}
          />

          {/* ================= PAYMENT ================= */}

          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />
          
          <Route path="/ve-da-dat" element={<BookingHistory/>} />
          {/* ================= ADMIN ================= */}

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================= NOT FOUND ================= */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

          {/* tuyến đường xem chi tiết phim theo id phim */}
          <Route path="/phim/:id" element={<MovieDetail />} />

          <Route path="/dat-ve/:showtimeId" element={<SeatSelection />} />

          <Route path="/tin-tuc" element={<NewsPage />} />

          {/* thêm đường dẫn đến trang rạp tại đây */}
          <Route path="/rap" element={<Theaters />} />

          {/* --- TRANG QUẢN TRỊ ADMIN --- */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />


        </Routes>

      </LayoutWrapper>

    </Router>
  );
}

export default App;