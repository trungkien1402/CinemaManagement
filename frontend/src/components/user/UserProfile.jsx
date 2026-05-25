import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const { user: authUser } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý việc nhập liệu trên Form
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    const userId = authUser?.id || authUser?.userId;
    if (!userId) { setLoading(false); return; }

    setLoading(true);
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    // 💡 Đã cập nhật endpoint mới không chứa tiền tố /admin công cộng công tác
    Promise.all([
      axios.get(`http://localhost:8080/api/users/${userId}`, config),
      axios.get(`http://localhost:8080/api/bookings/history/${userId}`, config).catch(() => ({ data: [] }))
    ])
    .then(([userRes, ticketsRes]) => {
      setProfileData(userRes.data);

      // Điền dữ liệu ban đầu từ database vào Form
      setEditForm({
        fullName: userRes.data.fullName || userRes.data.username || '',
        phone: userRes.data.phone || '',
        dateOfBirth: userRes.data.dateOfBirth ? userRes.data.dateOfBirth.substring(0, 10) : ''
      });

      let listTickets = [];
      if (Array.isArray(ticketsRes.data)) listTickets = ticketsRes.data;
      else if (ticketsRes.data?.data) listTickets = ticketsRes.data.data;
      else if (ticketsRes.data?.content) listTickets = ticketsRes.data.content;
      setTickets(listTickets);

      setLoading(false);
    })
    .catch((err) => {
      console.error("LỖI TẢI PROFILE:", err); // 💡 Đã sửa thành console.error chuẩn React
      setLoading(false);
    });
  }, [authUser]);

  // Xử lý sự kiện khi gõ vào ô Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Hàm gửi dữ liệu lên Database khi ấn nút Lưu
  const handleSaveProfile = async () => {
    try {
      const userId = Number(authUser?.id || authUser?.userId); // Ép kiểu số tương thích Java Long
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // 💡 Đã cập nhật endpoint PUT mới đồng bộ
      await axios.put(`http://localhost:8080/api/users/update/${userId}`, editForm, config);
      alert("Cập nhật thông tin thành công!");

      // Đồng bộ lại tên hiển thị tức thời trên giao diện
      setProfileData({ ...profileData, ...editForm });
    } catch (error) {
      console.error("Lỗi cập nhật DB:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Đang tải...</div>;
  if (!authUser) return <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '100px' }}>Vui lòng đăng nhập.</div>;

  const displayName = profileData?.fullName || authUser?.username || "Thành viên";
  const displayEmail = profileData?.email || authUser?.email || "Chưa cập nhật";

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-top">
        <h1>Tài Khoản</h1>
      </div>

      <div className="profile-container">
        {/* ================= SIDEBAR ================= */}
        <aside className="profile-sidebar">
          <div className="user-profile-info">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
              alt="avatar"
              className="avatar-img"
            />
            <h2>{displayName}</h2>
            <p className="user-email">{displayEmail}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <i className="fa-solid fa-ticket-simple"></i> Vé Của Tôi
            </button>
            <button
              className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <i className="fa-regular fa-user"></i> Thông Tin Cá Nhân
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fa-solid fa-gear"></i> Cài Đặt
            </button>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="profile-main-content">

          {/* ---------------- TAB 1: VÉ CỦA TÔI ---------------- */}
          {activeTab === 'tickets' && (
            <>
              <h2>Lịch Sử Đặt Vé</h2>
              {tickets.length > 0 ? tickets.map((t, index) => (
                <div className="ticket-card" key={t.bookingId || t.id || index}>
                  <img src={t.showtime?.movie?.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop"} alt="poster" className="ticket-poster" />
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <div>
                        <h3 className="movie-title">{t.showtime?.movie?.title || "Phim chưa rõ tên"}</h3>
                        <p className="booking-code">Mã: {t.bookingId || "BK001"}</p>
                      </div>
                      <span className={`status-badge ${t.status === 'SUCCESS' || t.status === 1 ? 'success' : 'watched'}`}>
                        {t.status === 'SUCCESS' || t.status === 1 ? 'Đã xác nhận' : 'Đã xem'}
                      </span>
                    </div>
                    <div className="ticket-details-grid">
                      <div><span className="detail-label">Rạp</span><span className="detail-value">{t.showtime?.room?.theater?.name || "CinemaX Vincom"}</span></div>
                      <div><span className="detail-label">Suất chiếu</span><span className="detail-value"><i className="fa-regular fa-calendar" style={{marginRight: '5px'}}></i> {t.showtime?.showDate} • {t.showtime?.startTime}</span></div>
                      <div style={{ gridColumn: '1 / -1' }}><span className="detail-label">Ghế</span><span className="detail-value">{Array.isArray(t.seats) ? t.seats.map(s => s.seatNumber).join(', ') : 'A5, A6'}</span></div>
                    </div>
                    <button className="btn-detail">Xem Chi Tiết</button>
                  </div>
                </div>
              )) : <p style={{color: '#888'}}>Bạn chưa đặt vé nào.</p>}
            </>
          )}

          {/* ---------------- TAB 2: THÔNG TIN CÁ NHÂN ---------------- */}
          {activeTab === 'info' && (
            <>
              <h2>Thông Tin Cá Nhân</h2>
              <div className="form-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ và Tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={displayEmail} className="form-input" disabled />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <button className="btn-save-primary" onClick={handleSaveProfile}>Lưu Thay Đổi</button>
              </div>
            </>
          )}

          {/* ---------------- TAB 3: CÀI ĐẶT ---------------- */}
          {activeTab === 'settings' && (
            <>
              <h2>Cài Đặt Tài Khoản</h2>
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Nhận thông báo qua Email</h4>
                    <p>Nhận email về vé đã đặt và các chương trình khuyến mãi</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-divider"></div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Đổi Mật Khẩu</h4>
                    <p>Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
                  </div>
                  <button className="btn-outline">Đổi mật khẩu</button>
                </div>
                <div className="setting-divider"></div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4 style={{color: '#e50914'}}>Xóa Tài Khoản</h4>
                    <p>Xóa vĩnh viễn tài khoản và lịch sử giao dịch</p>
                  </div>
                  <button className="btn-danger-outline">Xóa tài khoản</button>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default UserProfile;