import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../style/NotificationBell.css'; 
//import icon
import bellIcon from '../../assets/bell.png';
import movieIcon from '../../assets/film.png';
import payIcon from '../../assets/checked.png';
import bookingIcon from '../../assets/booking.png';
import emailIcon from '../../assets/email.png';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  
  // 🛠️ Biến useRef dùng để lưu giữ số lượng thông báo chưa đọc của lần quét trước đó
  const prevUnreadCountRef = useRef(0);

  // Lấy dữ liệu thông báo từ Backend
  const fetchNotifications = () => {
    axios.get('http://localhost:8080/api/notifications')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        
        // 1. Tính toán số lượng thông báo chưa đọc mới nhận về
        const currentUnreadCount = data.filter(n => !n.read).length;

        // 2. SO SÁNH: Nếu số thông báo chưa đọc HIỆN TẠI nhiều hơn LẦN TRƯỚC -> Có thông báo mới tinh!
        if (currentUnreadCount > prevUnreadCountRef.current) {
          playNotificationSound(); // 🔊 Phát tiếng chuông báo ngay lập tức!
        }

        // 3. Cập nhật lại bộ nhớ đệm cho lần quét tiếp theo
        prevUnreadCountRef.current = currentUnreadCount;
        setNotifications(data);
      })
      .catch(err => console.error("Lỗi lấy thông báo:", err));
  };

  // 🔊 HÀM PHÁT ÂM THANH THÔNG BÁO
  const playNotificationSound = () => {
    try {
      // Đường dẫn trỏ tới file mp3 đặt trong thư mục public
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.6; // Đặt mức âm lượng 60% nghe cho vừa tai, không bị giật mình
      audio.play();
    } catch (error) {
      console.log("Trình duyệt chặn tự động phát âm thanh nếu người dùng chưa tương tác:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Cơ chế Polling: Cứ mỗi 10 giây tự động quét DB một lần để cập nhật thông báo mới
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sự kiện lắng nghe click outside dành riêng cho chuông
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tính số lượng thông báo chưa đọc hiện tại
  const unreadCount = notifications.filter(n => !n.read).length;

  // Xử lý khi nhấn "Đánh dấu đã đọc tất cả"
  const handleReadAll = () => {
    axios.put('http://localhost:8080/api/notifications/read-all')
      .then(() => {
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  // Hàm hiển thị Icon tương ứng với từng loại loại thông báo
  const getIcon = (type) => {
    if (type === 'MOVIE') {
        return <img src={movieIcon} alt="Movie" className="nav-icon" />;
    }
    if (type === 'PAYMENT') {
        return <img src={payIcon} alt="Payment" className="nav-icon" />;
    }
    if (type === 'BOOKING') {
        return <img src={bookingIcon} alt="Booking" className="nav-icon" />;
    }
    if (type === 'EMAIL') {
        return <img src={emailIcon} alt="Email" className="nav-icon" />;
    }   
    if (type === 'ERROR') {
        return <span className="nav-icon-emoji">⚠️</span>; // Giữ emoji hoặc thay thế nếu có asset sau này
    }   
    return <img src={bellIcon} alt="Notification" className="nav-icon" />;
};

  const handleOpenBell = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState === true && unreadCount > 0) {
      axios.put('http://localhost:8080/api/notifications/read-all')
        .then(() => {
          fetchNotifications(); 
        })
        .catch(err => console.error("Lỗi tự động cập nhật trạng thái đã đọc:", err));
    }
  };

  return (
  <div className="notification-bell-container" ref={bellRef}>
    {/* Biểu tượng quả chuông trên Navbar */}
    <div className="bell-icon" onClick={handleOpenBell}>
        <img src={bellIcon} alt="Notification Bell" />
        {unreadCount > 0 && (
            <span className="bell-badge">{unreadCount}</span>
        )}
    </div>

      {/* Khung danh sách thông báo thả xuống khi click vào chuông */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Thông báo mới</h3>
            {unreadCount > 0 && <button onClick={handleReadAll}>Đọc tất cả</button>}
          </div>
          
          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="no-notification">Không có thông báo nào</div>
            ) : (
              notifications.map((noti) => (
                <div key={noti.id || noti.notiId} className={`notification-item ${noti.read ? 'read' : 'unread'}`}>
                  <span className="noti-icon">{getIcon(noti.type)}</span>
                  <div className="noti-content">
                    <p className="noti-title">{noti.title}</p>
                    <p className="noti-message">{noti.message}</p>
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