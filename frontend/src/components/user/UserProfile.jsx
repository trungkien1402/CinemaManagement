import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import '../style/UserProfile.css';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState('tickets');
  const { user: authUser } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý avatar
  const [avatarPreview, setAvatarPreview] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop");
  const [showTooltip, setShowTooltip] = useState(false);

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    const userId = authUser?.id || authUser?.userId;
    if (!userId) { setLoading(false); return; }

    setLoading(true);

    Promise.all([
      axiosClient.get(`/users/${userId}`),
      axiosClient.get(`/bookings/history/${userId}`).catch(() => ({ data: [] }))
    ])
    .then(([userRes, ticketsRes]) => {
      setProfileData(userRes.data);

      // Cập nhật avatar từ Database nếu có
      if (userRes.data.avatarUrl || userRes.data.avatar) {
        setAvatarPreview(userRes.data.avatarUrl || userRes.data.avatar);
      }

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

  // ----------------------------------------------------------------
  // Helper function chuyển file thành Base64
  // ----------------------------------------------------------------
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  // ----------------------------------------------------------------
  // XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN LÊN SERVER BẰNG JSON BASE64
  // ----------------------------------------------------------------
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64Image = await convertBase64(file);
        setAvatarPreview(base64Image);

        const userId = authUser?.id || authUser?.userId;

        const response = await axiosClient.put(
          `/users/update-avatar/${userId}`,
          { avatarUrl: base64Image }
        );

        alert(t('avatar.alerts.success') || "Cập nhật ảnh đại diện thành công!");

        let storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && response.data?.avatarUrl) {
          storedUser.avatar = response.data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));
          window.location.reload();
        }

      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        alert(t('avatar.alerts.fail') || "Lưu ảnh thất bại! Vui lòng thử lại.");
      }
    }
  };

  const handleSaveProfile = async () => {
    // Validate ngày sinh
    if (editForm.dateOfBirth) {
      const selectedDate = new Date(editForm.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        alert(t('user.info.alerts.dobFuture') || "Ngày sinh không thể ở trong tương lai!");
        return;
      }

      const birthYear = selectedDate.getFullYear();
      if (birthYear < 1900) {
        alert(t('user.info.alerts.dobTooOld') || "Năm sinh không hợp lệ (phải từ năm 1900 trở đi)!");
        return;
      }
    }

    try {
      const userId = Number(authUser?.id || authUser?.userId);

      await axiosClient.put(`/users/update/${userId}`, editForm);
      alert(t('info.alerts.success') || "Cập nhật thông tin thành công!");
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
      alert(t('info.alerts.fail') || "Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  const handleToggleNotification = async (e) => {
    const checked = e.target.checked;
    setEmailNotify(checked);
    try {
      const userId = authUser?.id || authUser?.userId;
      await axiosClient.put(`/users/settings/notification/${userId}`, { emailNotify: checked });
    } catch (error) {
      console.log(t('settings.notifications.alertTemp') || "Đã cập nhật cấu hình thông báo tạm thời.");
    }
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPwdForm({ ...pwdForm, [name]: value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== confirmPassword) {
      alert(t('pwdModal.alerts.mismatch') || "Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!");
      return;
    }

    try {
      const userId = authUser?.id || authUser?.userId;

      await axiosClient.put(`/users/change-password/${userId}`, {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });

      alert(t('pwdModal.alerts.success') || "Đổi mật khẩu thành công!");
      setShowPwdModal(false);
      setPwdForm({ oldPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('pwdModal.alerts.failDefault') || "Mật khẩu cũ không chính xác!");
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(t('settings.deleteAccount.confirm1') || "CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này không?");
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(t('settings.deleteAccount.confirm2') || "Lịch sử đặt vé sẽ mất hết. Chắc chắn chứ ông?");
    if (secondConfirm) {
      try {
        const userId = authUser?.id || authUser?.userId;

        await axiosClient.delete(`/users/delete/${userId}`);
        alert(t('settings.deleteAccount.success') || "Xóa tài khoản thành công!");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        alert(t('settings.deleteAccount.fail') || "Xóa tài khoản thất bại!");
      }
    }
  };

  if (loading) return <div className="loading-text">{t('user.loading')}</div>;
  if (!authUser) return <div className="error-text">{t('user.loginRequired')}</div>;

  const displayName = profileData?.fullName || authUser?.username || t('user.defaultUser');
  const displayEmail = profileData?.email || authUser?.email || t('user.defaultEmail');

  // 🚀 LẤY ĐIỂM TỪ BACKEND
  const userPoints = profileData?.points || 0;
  const isVip = userPoints >= 1000;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-top">
        <h1>{t('user.title')}</h1>
      </div>

      <div className="profile-container">
        {/* ================= SIDEBAR ================= */}
        <aside className="profile-sidebar">
          <div className="user-profile-info">

            <div className="avatar-container" onClick={() => document.getElementById('avatar-upload').click()}>
              <img
                src={avatarPreview}
                alt="avatar"
                className="avatar-img"
              />
              <div className="avatar-overlay">
                <i className="fa-solid fa-camera"></i>
                <span>{t('user.avatar.update')}</span>
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                style={{display: 'none'}}
                onChange={handleAvatarChange}
              />
            </div>

            <h2>{displayName}</h2>
            <p className="user-email">{displayEmail}</p>


            {isVip ? (
              <div className="vip-badge gold">
                <i className="fa-solid fa-ribbon"></i> {t('user.badges.vip')}
              </div>
            ) : (
              <div className="vip-badge standard">
                <i className="fa-solid fa-star"></i> {t('user.badges.standard')}
              </div>
            )}
          </div>

          <div className="points-card-container">
            <div className="points-header">
              <span>{t('user.points')}</span>
              <i className="fa-solid fa-star text-warning"></i>
            </div>
            <div className="points-value">
              {userPoints.toLocaleString('vi-VN')}
            </div>
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
              {tickets.length > 0 ? tickets.map((tick, index) => (
                <div className="ticket-card" key={tick.ticketId || index}>
                  <img src={tick.showtime?.movie?.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop"} alt="poster" className="ticket-poster" />
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <div>
                        <h3 className="movie-title">{tick.showtime?.movie?.title || t('user.tickets.movieTitleDefault')}</h3>
                        <p className="booking-code">{t('user.tickets.ticketCode')}{tick.ticketId}</p>
                      </div>

                      {tick.statusTk === 1 ? (
                        <span className="status-badge-checked">{t('user.tickets.status.watched')}</span>
                      ) : (
                        <span className="status-badge-pending">{t('user.tickets.status.pending')}</span>
                      )}
                    </div>

                    <div className="ticket-details-grid">
                      <div><span className="detail-label">{t('user.tickets.details.theater')}</span><span className="detail-value">{tick.showtime?.room?.theater?.name || "CinemaX"}</span></div>
                      <div>
                        <span className="detail-label">{t('user.tickets.details.showtime')}</span>
                        <span className="detail-value">
                          <i className="fa-regular fa-calendar calendar-icon"></i> {tick.showtime?.showDate} • {tick.showtime?.startTime}
                        </span>
                      </div>
                      <div className="detail-group-full">
                        <span className="detail-label">{t('user.tickets.details.seats')}</span>
                        <span className="detail-value seat-highlight">
                          {tick.seat?.seatNumber || t('user.tickets.details.unknown')}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-action-right">
                      <button className="btn-detail" onClick={() => setSelectedTicket(tick)}>
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
                      max={new Date().toISOString().split('T')[0]}
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
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-solid fa-clapperboard" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.modal.movieLabel')}
                </span>
                <span className="ticket-modal-value movie-highlight">{selectedTicket.showtime?.movie?.title}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-solid fa-location-dot" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.details.theater')}:
                </span>
                <span className="ticket-modal-value">{selectedTicket.showtime?.room?.theater?.name || "CinemaX Vincom"}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-solid fa-door-open" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.details.room')}:
                </span>
                <span className="ticket-modal-value">{selectedTicket.showtime?.room?.name || t('user.tickets.details.defaultRoom')}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-regular fa-calendar-days" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.details.showtime')}:
                </span>
                <span className="ticket-modal-value time-highlight">{selectedTicket.showtime?.showDate} • {selectedTicket.showtime?.startTime}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-solid fa-chair" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.details.selectedSeats')}:
                </span>
                <span className="ticket-modal-value seat-highlight">{selectedTicket.seat?.seatNumber}</span>
              </div>
              <div className="ticket-modal-row">
                <span className="ticket-modal-label">
                  <i className="fa-solid fa-money-bill-wave" style={{ color: '#ffcc00', marginRight: '8px', width: '20px', textAlign: 'center' }}></i>
                  {t('user.tickets.details.totalPrice')}:
                </span>
                <span className="ticket-modal-value price-highlight">{String(selectedTicket.totalPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ</span>
              </div>
              <div className="ticket-modal-status-section">
                <span className="ticket-modal-label">{t('user.tickets.modal.statusLabel')}:</span>
                {selectedTicket.statusTk === 1 ? (
                  <span className="status-badge-checked">
                    <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                    {t('user.tickets.modal.statusWatched')}
                  </span>
                ) : (
                  <span className="status-badge-pending">
                    <i className="fa-solid fa-circle-dot" style={{ marginRight: '6px' }}></i>
                    {t('user.tickets.modal.statusPending')}
                  </span>
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