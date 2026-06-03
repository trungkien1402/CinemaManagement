import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../style/UserProfile.css';
import { useTranslation } from 'react-i18next'; // Khởi tạo thư viện dịch

const UserProfile = () => {
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('tickets');
  const { user: authUser } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý Modal xem chi tiết vé
  const [selectedTicket, setSelectedTicket] = useState(null);

  // State quản lý việc nhập liệu trên Form Thông Tin Cá Nhân
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: ''
  });

  // State quản lý phần cài đặt
  const [emailNotify, setEmailNotify] = useState(true);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(''); // Lưu mật khẩu nhập lại
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
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

      if (userRes.data.emailNotify !== undefined) {
        setEmailNotify(userRes.data.emailNotify);
      }

      let listTickets = [];
      if (Array.isArray(ticketsRes.data)) listTickets = ticketsRes.data;
      else if (ticketsRes.data?.data) listTickets = ticketsRes.data.data;
      else if (ticketsRes.data?.content) listTickets = ticketsRes.data.content;
      setTickets(listTickets);

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
      alert(t('user.info.alerts.success'));
      setProfileData({ ...profileData, ...editForm });

      let storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.fullName = editForm.fullName;
        storedUser.username = editForm.fullName;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      window.location.reload();
    } catch (error) {
      console.error("Lỗi cập nhật DB:", error);
      alert(t('user.info.alerts.fail'));
    }
  };

  const handleToggleNotification = async (e) => {
    const checked = e.target.checked;
    setEmailNotify(checked);
    try {
      const userId = authUser?.id || authUser?.userId;
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`http://localhost:8080/api/users/settings/notification/${userId}`, { emailNotify: checked }, config);
    } catch (error) {
      console.log(t('user.settings.notifications.alertTemp'));
    }
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPwdForm({ ...pwdForm, [name]: value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== confirmPassword) {
      alert(t('user.pwdModal.alerts.mismatch'));
      return;
    }

    try {
      const userId = authUser?.id || authUser?.userId;
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      await axios.put(`http://localhost:8080/api/users/change-password/${userId}`, {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      }, config);

      alert(t('user.pwdModal.alerts.success'));
      setShowPwdModal(false);
      setPwdForm({ oldPassword: '', newPassword: '' });
      setConfirmPassword(''); // Xóa mật khẩu xác nhận
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('user.pwdModal.alerts.failDefault'));
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(t('user.settings.deleteAccount.confirm1'));
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(t('user.settings.deleteAccount.confirm2'));
    if (secondConfirm) {
      try {
        const userId = authUser?.id || authUser?.userId;
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        await axios.delete(`http://localhost:8080/api/users/delete/${userId}`, config);
        alert(t('user.settings.deleteAccount.success'));
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        alert(t('user.settings.deleteAccount.fail'));
      }
    }
  };

  if (loading) return <div className="loading-text">{t('user.loading')}</div>;
  if (!authUser) return <div className="error-text">{t('user.loginRequired')}</div>;

  const displayName = profileData?.fullName || authUser?.username || t('user.defaultUser');
  const displayEmail = profileData?.email || authUser?.email || t('user.defaultEmail');

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-top">
        <h1>{t('user.title')}</h1>
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
              <i className="fa-solid fa-ticket-simple"></i> {t('user.tabs.myTickets')}
            </button>
            <button
              className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <i className="fa-regular fa-user"></i> {t('user.tabs.personalInfo')}
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fa-solid fa-gear"></i> {t('user.tabs.settings')}
            </button>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="profile-main-content">

          {/* ---------------- TAB 1: VÉ CỦA TÔI ---------------- */}
          {activeTab === 'tickets' && (
            <>
              <h2>{t('user.tickets.title')}</h2>
              {tickets.length > 0 ? tickets.map((tItem, index) => (
                <div className="ticket-card" key={tItem.ticketId || index}>
                  <img src={tItem.showtime?.movie?.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop"} alt="poster" className="ticket-poster" />
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <div>
                        <h3 className="movie-title">{tItem.showtime?.movie?.title || t('user.tickets.movieTitleDefault')}</h3>
                        <p className="booking-code">{t('user.tickets.ticketCode')}{tItem.ticketId}</p>
                      </div>

                      {tItem.statusTk === 1 ? (
                        <span className="status-badge-checked">{t('user.tickets.status.watched')}</span>
                      ) : (
                        <span className="status-badge-pending">{t('user.tickets.status.pending')}</span>
                      )}
                    </div>

                    <div className="ticket-details-grid">
                      <div><span className="detail-label">{t('user.tickets.details.theater')}</span><span className="detail-value">{tItem.showtime?.room?.theater?.name || "CinemaX"}</span></div>
                      <div>
                        <span className="detail-label">{t('user.tickets.details.showtime')}</span>
                        <span className="detail-value">
                          <i className="fa-regular fa-calendar calendar-icon"></i> {tItem.showtime?.showDate} • {tItem.showtime?.startTime}
                        </span>
                      </div>
                      <div className="detail-group-full">
                        <span className="detail-label">{t('user.tickets.details.seats')}</span>
                        <span className="detail-value seat-highlight">
                          {tItem.seat?.seatNumber || "Chưa rõ"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-action-right">
                      <button className="btn-detail" onClick={() => setSelectedTicket(tItem)}>
                        {t('user.tickets.buttons.viewDetail')}
                      </button>
                    </div>
                  </div>
                </div>
              )) : <p className="booking-code">{t('user.tickets.empty')}</p>}
            </>
          )}

          {/* ---------------- TAB 2: THÔNG TIN CÁ NHÂN ---------------- */}
          {activeTab === 'info' && (
            <>
              <h2>{t('user.info.title')}</h2>
              <div className="form-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('user.info.labels.fullName')}</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('user.info.labels.email')}</label>
                    <input type="email" value={displayEmail} className="form-input" disabled />
                  </div>
                  <div className="form-group">
                    <label>{t('user.info.labels.phone')}</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('user.info.labels.dob')}</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <button className="btn-save-primary" onClick={handleSaveProfile}>{t('user.info.buttons.save')}</button>
              </div>
            </>
          )}

          {/* ---------------- TAB 3: CÀI ĐẶT ---------------- */}
          {activeTab === 'settings' && (
            <>
              <h2>{t('user.settings.title')}</h2>
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t('user.settings.notifications.title')}</h4>
                    <p>{t('user.settings.notifications.desc')}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailNotify}
                      onChange={handleToggleNotification}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-divider"></div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t('user.settings.language.title')}</h4>
                    <p>{t('user.settings.language.desc')}</p>
                  </div>
                  <select
                    className="form-input language-select"
                    value={i18n.language || 'vi'}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="ko">한국어</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div className="setting-divider"></div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t('user.settings.password.title')}</h4>
                    <p>{t('user.settings.password.desc')}</p>
                  </div>
                  <button className="btn-outline" onClick={() => setShowPwdModal(true)}>
                    {t('user.settings.password.button')}
                  </button>
                </div>
                <div className="setting-divider"></div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4 className="error-text">{t('user.settings.deleteAccount.title')}</h4>
                    <p>{t('user.settings.deleteAccount.desc')}</p>
                  </div>
                  <button className="btn-danger-outline" onClick={handleDeleteAccount}>
                    {t('user.settings.deleteAccount.button')}
                  </button>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 🍿 POPUP MODAL CHI TIẾT VÉ */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ticket-modal-close-btn" onClick={() => setSelectedTicket(null)}>&times;</button>
            <h2 className="ticket-modal-title">{t('user.tickets.modal.title')}</h2>
            <p className="ticket-modal-subtitle">{t('user.tickets.modal.subtitle')}</p>
            <div className="ticket-modal-qr-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedTicket.ticketId}`}
                alt="Ticket QR Code"
                className="ticket-modal-qr-image"
              />
            </div>
            <p className="ticket-modal-code">{t('user.tickets.modal.qrLabel')}{selectedTicket.ticketId}</p>
            <div className="ticket-modal-details">
              <div className="ticket-modal-row"><span className="ticket-modal-label">🎬 Phim:</span><span className="ticket-modal-value movie-highlight">{selectedTicket.showtime?.movie?.title}</span></div>
              <div className="ticket-modal-row"><span className="ticket-modal-label">📍 {t('user.tickets.details.theater')}:</span><span className="ticket-modal-value">{selectedTicket.showtime?.room?.theater?.name || "CinemaX Vincom"}</span></div>
              <div className="ticket-modal-row"><span className="ticket-modal-label">🚪 {t('user.tickets.details.room')}:</span><span className="ticket-modal-value">{selectedTicket.showtime?.room?.name || "Phòng chiếu mặc định"}</span></div>
              <div className="ticket-modal-row"><span className="ticket-modal-label">🗓️ {t('user.tickets.details.showtime')}:</span><span className="ticket-modal-value time-highlight">{selectedTicket.showtime?.showDate} • {selectedTicket.showtime?.startTime}</span></div>
              <div className="ticket-modal-row"><span className="ticket-modal-label">💺 {t('user.tickets.details.seats')}:</span><span className="ticket-modal-value seat-highlight">{selectedTicket.seat?.seatNumber}</span></div>
              <div className="ticket-modal-row"><span className="ticket-modal-label">💰 {t('user.tickets.details.totalPrice')}:</span><span className="ticket-modal-value price-highlight">{String(selectedTicket.totalPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ</span></div>
              <div className="ticket-modal-status-section">
                <span className="ticket-modal-label">Trạng thái:</span>
                {selectedTicket.statusTk === 1 ? (
                  <span className="status-badge-checked">{t('user.tickets.modal.statusWatched')}</span>
                ) : (
                  <span className="status-badge-pending">{t('user.tickets.modal.statusPending')}</span>
                )}
              </div>
            </div>
            <p className="ticket-modal-footer-note">{t('user.tickets.modal.note')}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔐 POPUP MODAL ĐỔI MẬT KHẨU */}
      {/* ========================================================================= */}
      {showPwdModal && (
        <div className="ticket-modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="ticket-modal-content pwd-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ticket-modal-close-btn" onClick={() => setShowPwdModal(false)}>&times;</button>
            <h2 className="ticket-modal-title pwd-modal-title">{t('user.pwdModal.title')}</h2>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group pwd-form-group">
                <label>{t('user.pwdModal.labels.current')}</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={pwdForm.oldPassword}
                  onChange={handlePasswordChangeInput}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group pwd-form-group">
                <label>{t('user.pwdModal.labels.new')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={pwdForm.newPassword}
                  onChange={handlePasswordChangeInput}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group pwd-form-group last">
                <label>{t('user.pwdModal.labels.confirm')}</label>
                <input
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  className="form-input"
                  required
                />
              </div>

              <div className="pwd-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowPwdModal(false)}>{t('user.pwdModal.buttons.cancel')}</button>
                <button type="submit" className="btn-save-primary">{t('user.pwdModal.buttons.submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;