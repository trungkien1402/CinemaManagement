import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Theaters.css';

const Theaters = () => {
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. GỌI API LẤY DỮ LIỆU RẠP THỰC TẾ TỪ DATABASE
  useEffect(() => {
    axios.get('http://localhost:8080/api/theaters')
      .then(res => {
        setTheaters(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách rạp từ Database:", err);
        setLoading(false);
      });
  }, []);

  // 2. HÀM XỬ LÝ CHUYỂN TRANG THÔNG MINH
  const handleViewSchedule = (theaterId) => {
    // Chuyển sang trang lịch chiếu VÀ "bỏ túi" đem theo mã rạp được chọn
    navigate('/lich-chieu', { state: { selectedTheaterId: theaterId } });
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Đang tải hệ thống rạp...</div>;

  return (
    <div className="theaters-wrapper">
      <div className="theaters-header">
        <h1>Hệ Thống Rạp</h1>
        <p>Hệ thống rạp chiếu phim hiện đại trên toàn quốc</p>
      </div>

      <div className="theaters-grid">
        {theaters.map((theater, index) => {
          // MẸO: Lưu trữ link ảnh fallback phòng trường hợp DB chưa có cột ảnh rạp
          const fallbackImages = [
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=800&auto=format&fit=crop'
          ];
          const displayImage = theater.image || fallbackImages[index % 4];
          const displayAmenities = theater.amenities || ['IMAX', 'VIP Lounge', 'Dolby Atmos'];

          return (
            <div className="theater-card" key={theater.theaterId || index}>

              <div className="theater-img-box">
                {displayAmenities.includes('IMAX') && (
                  <span className="theater-badge">IMAX</span>
                )}
                <img src={displayImage} alt={theater.name} />
              </div>

              <div className="theater-info">
                <h2 className="theater-name">CinemaX {theater.name}</h2>

                {/* 💡 ĐÃ SỬA: Chuyển sang theater.location cho khớp với Entity Java */}
                <div className="theater-detail-row">
                  <i>📍</i>
                  <span style={{ whiteSpace: 'pre-line' }}>{theater.location || "Đang cập nhật địa chỉ"}</span>
                </div>

                <div className="theater-detail-row">
                  <i>📞</i>
                  <span>{theater.phone || "1900 xxxx"}</span>
                </div>

                <div className="theater-detail-row">
                  <i>🕒</i>
                  <span>{theater.operatingHours || "8:00 - 23:30 hàng ngày"}</span>
                </div>

                <div className="amenities-section">
                  <div className="amenities-title">Tiện ích</div>
                  <div className="amenities-tags">
                    {displayAmenities.map((amenity, idx) => (
                      <span className="amenity-tag" key={idx}>
                        <span className="star">⭐</span> {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="theater-actions">
                  <button
                    className="btn-primary-theater"
                    onClick={() => handleViewSchedule(theater.theaterId)}
                  >
                    Xem Lịch Chiếu
                  </button>
                  <button
                    className="btn-secondary-theater"
                    onClick={() => window.open(theater.mapLink || 'https://maps.google.com', '_blank')}
                  >
                    Chỉ Đường
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Theaters;