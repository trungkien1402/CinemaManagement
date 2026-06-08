import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../style/NotificationBell.css'; 
import { useTranslation } from 'react-i18next';

const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'vi';

  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  
  // luu so luong thong bao chua doc lan truoc
  const prevUnreadCountRef = useRef(0);

  // lay danh sach thong bao tu server
  const fetchNotifications = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setNotifications([]);
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user?.id || user?.userId;
    if (!userId) {
      setNotifications([]);
      return;
    }
    const url = `http://localhost:8080/api/notifications?userId=${userId}`;

    axios.get(url)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        
        // dem so thong bao chua doc
        const currentUnreadCount = data.filter(n => !n.read).length;

        // phat am thanh neu co thong bao moi
        if (currentUnreadCount > prevUnreadCountRef.current) {
          playNotificationSound(); 
        }

        // cap nhat lai bo nho dem
        prevUnreadCountRef.current = currentUnreadCount;
        setNotifications(data);
      })
      .catch(err => console.error("Lỗi lấy thông báo:", err));
  };

  // phat am thanh thong bao
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.6;
      audio.play();
    } catch (error) {
      console.log("trinh duyet chan tu dong phat am thanh", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    // tu dong lay thong bao moi 10 giay
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // dong dropdown khi click ra ngoai
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // danh dau tat ca da doc
  const handleReadAll = () => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userId = user?.id || user?.userId;
    const url = userId 
      ? `http://localhost:8080/api/notifications/read-all?userId=${userId}`
      : 'http://localhost:8080/api/notifications/read-all';

    axios.put(url)
      .then(() => {
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  // lay icon phu hop voi loai thong bao
  const getIcon = (type) => {
    if (type === 'MOVIE') return <i className="fa-solid fa-film" style={{ color: '#e50914' }}></i>;
    if (type === 'PAYMENT') return <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>;
    if (type === 'BOOKING') return <i className="fa-solid fa-ticket" style={{ color: '#ffb300' }}></i>;
    if (type === 'EMAIL') return <i className="fa-regular fa-envelope" style={{ color: '#3b82f6' }}></i>;   
    if (type === 'ERROR') return <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444' }}></i>;   
    return <i className="fa-regular fa-bell" style={{ color: '#a0aec0' }}></i>;
  };

  const handleOpenBell = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState === true && unreadCount > 0) {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || user?.userId;
      const url = userId 
        ? `http://localhost:8080/api/notifications/read-all?userId=${userId}`
        : 'http://localhost:8080/api/notifications/read-all';

      axios.put(url)
        .then(() => {
          fetchNotifications(); 
        })
        .catch(err => console.error("Lỗi tự động cập nhật trạng thái đã đọc:", err));
    }
  };

  // Hàm dịch động nội dung thông báo từ Backend lưu tiếng Việt
  const translateNoti = (text, lang) => {
    if (!text) return "";
    if (!lang.startsWith('en')) return text; // Nếu là Tiếng Việt thì giữ nguyên

    let translated = text;

    // 1. Dịch tiêu đề/nội dung đặt vé thành công
    if (translated === "Đặt vé thành công 🎉") {
      return "Booking Successful 🎉";
    }

    if (translated.includes("đã mua vé")) {
      translated = translated
        .replace(/Khách hàng (\S+) đã mua vé '([^']+)' \(Ghế: ([^\)]+)\)/g, "Customer $1 purchased ticket(s) for '$2' (Seat(s): $3)")
        .replace(/\(Đã dùng (\d+) điểm\)/g, "(Used $1 points)")
        .replace(/Được cộng thêm (\d+) điểm thưởng\./g, "Earned $1 reward points.");
      return translated;
    }

    // 2. Dịch thông báo suất chiếu mới
    if (translated.startsWith("Suất chiếu mới cho phim:")) {
      return translated.replace("Suất chiếu mới cho phim:", "New showtime for movie:");
    }

    if (translated.includes("bạn yêu thích đã có suất chiếu mới")) {
      translated = translated
        .replace(/Phim "([^"]+)" bạn yêu thích đã có suất chiếu mới vào ngày (\S+) lúc (\S+) tại ([^\(]+) \(([^\)]+)\)\./g, 
                 "Your favorite movie \"$1\" has a new showtime on $2 at $3 at $4 ($5).")
        .replace(/Phòng Phòng (\w+)/g, "Room $1")
        .replace(/Phòng (\w+)/g, "Room $1"); // Loại bỏ duplication "Phòng Phòng" nếu có
      return translated;
    }

    return translated;
  };

  return (
    <div className="notification-bell-container" ref={bellRef}>
      {/* icon chuong */}
      <div className="bell-icon" onClick={handleOpenBell}>
        <i className="fa-regular fa-bell" style={{ color: '#ffffff', transition: 'color 0.3s' }}></i>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </div>

      {/* dropdown danh sach thong bao */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>{t('nav.notifications.title') || "Thông báo mới"}</h3>
            {unreadCount > 0 && <button onClick={handleReadAll}>{t('nav.notifications.readAll') || "Đọc tất cả"}</button>}
          </div>
          
          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="no-notification">{t('nav.notifications.empty') || "Không có thông báo nào"}</div>
            ) : (
              notifications.map((noti) => (
                <div key={noti.id || noti.notiId} className={`notification-item ${noti.read ? 'read' : 'unread'}`}>
                  <span className="noti-icon">{getIcon(noti.type)}</span>
                  <div className="noti-content">
                    <p className="noti-title">{translateNoti(noti.title, currentLang)}</p>
                    <p className="noti-message">{translateNoti(noti.message, currentLang)}</p>
                    <span className="noti-time">
                      {new Date(noti.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;