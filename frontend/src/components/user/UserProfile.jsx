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

  // State lưu thông tin vé đang chọn để mở Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

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

    Promise.all([
      axios.get(`http://localhost:8080/api/users/${userId}`, config),
      axios.get(`http://localhost:8080/api/bookings/history/${userId}`, config).catch(() => ({ data: [] }))
    ])
    .then(([userRes, ticketsRes]) => {
      setProfileData(userRes.data);

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

      setSelectedTicket(null);
      setLoading(false);
    })
    .catch((err) => {
      console.error("LỖI TẢI PROFILE:", err);
      setLoading(false);
    });
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      const userId = Number(authUser?.id || authUser?.userId);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await axios.put(`http://localhost:8080/api/users/update/${userId}`, editForm, config);
      alert("Cập nhật thông tin thành công!");
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
                <div className="ticket-card" key={t.ticketId || index}>
                  <img src={t.showtime?.movie?.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop"} alt="poster" className="ticket-poster" />
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <div>
                        <h3 className="movie-title">{t.showtime?.movie?.title || "Phim đã chọn"}</h3>
                        <p className="booking-code">Mã vé: {t.ticketId}</p>
                      </div>

                      {t.statusTk === 1 ? (
                        <span className="status-badge-checked">
                          Đã xem
                        </span>
                      ) : (
                        <span className="status-badge-pending">
                          Chưa xem
                        </span>
                      )}
                    </div>

                    <div className="ticket-details-grid">
                      <div><span className="detail-label">Rạp</span><span className="detail-value">{t.showtime?.room?.theater?.name || "CinemaX"}</span></div>
                      <div>
                        <span className="detail-label">Suất chiếu</span>
                        <span className="detail-value">
                          <i className="fa-regular fa-calendar" style={{marginRight: '5px'}}></i> {t.showtime?.showDate} • {t.showtime?.startTime}
                        </span>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span className="detail-label">Ghế</span>
                        <span className="detail-value" style={{ color: '#e50914', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {t.seat?.seatNumber || "Chưa rõ"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-action-right">
                      <button className="btn-detail" onClick={() => setSelectedTicket(t)}>
                        Xem Chi Tiết
                      </button>
                    </div>

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

      {/* ========================================================================= */}
      {/* 💡 POPUP MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-content" onClick={(e) => e.stopPropagation()}>

            <button className="ticket-modal-close-btn" onClick={() => setSelectedTicket(null)}>
              &times;
            </button>

            <h2 className="ticket-modal-title">VÉ XEM PHIM ĐIỆN TỬ</h2>
            <p className="ticket-modal-subtitle">CinemaX hân hạnh phục vụ bạn</p>

            <div className="ticket-modal-qr-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedTicket.ticketId}`}
                alt="Ticket QR Code"
                className="ticket-modal-qr-image"
              />
            </div>

            <p className="ticket-modal-code">MÃ VÉ: {selectedTicket.ticketId}</p>

            <div className="ticket-modal-details">
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">🎬 Phim:</span>
                <span className="ticket-modal-value movie-highlight">{selectedTicket.showtime?.movie?.title}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">📍 Rạp:</span>
                <span className="ticket-modal-value">{selectedTicket.showtime?.room?.theater?.name || "CinemaX Vincom"}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">🚪 Phòng:</span>
                <span className="ticket-modal-value">{selectedTicket.showtime?.room?.name || "Phòng chiếu mặc định"}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">🗓️ Suất chiếu:</span>
                <span className="ticket-modal-value time-highlight">{selectedTicket.showtime?.showDate} • {selectedTicket.showtime?.startTime}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">💺 Ghế đã chọn:</span>
                <span className="ticket-modal-value seat-highlight">{selectedTicket.seat?.seatNumber}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">💰 Tổng tiền:</span>
                <span className="ticket-modal-value price-highlight">
                  {String(selectedTicket.totalPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ
                </span>
              </div>

              <div className="ticket-modal-status-section">
                <span className="ticket-modal-label">Trạng thái:</span>
                {selectedTicket.statusTk === 1 ? (
                  <span className="status-badge-checked">
                    🟢 Đã Check-in (Đã xem)
                  </span>
                ) : (
                  <span className="status-badge-pending">
                    🟡 Chưa sử dụng (Chờ soát vé)
                  </span>
                )}
              </div>
            </div>

            <p className="ticket-modal-footer-note">
              *Vui lòng đưa mã QR này cho nhân viên tại quầy soát vé để quét nhận diện vào phòng chiếu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;