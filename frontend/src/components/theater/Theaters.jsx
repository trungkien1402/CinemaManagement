import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import cinemaAddressIcon from '../../assets/cinema address.png';
import phoneIcon from '../../assets/phone-call.png';
import clockIcon from '../../assets/clock.png';

import '../style/Theaters.css';

const Theaters = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 STATE MỚI: Lưu Tỉnh/Thành phố đang được chọn
  const [selectedCity, setSelectedCity] = useState('all');

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

  const handleViewSchedule = (theaterId) => {
    navigate('/lich-chieu', { state: { selectedTheaterId: theaterId } });
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>{t('theaters.status.loading') || "Đang tải hệ thống rạp..."}</div>;

  // 💡 LỌC DANH SÁCH THÀNH PHỐ DUY NHẤT TỪ DATA (Ưu tiên cột city hoặc fallback location nếu city trống)
  const cities = ['all', ...new Set(theaters.map(t => t.city || t.location).filter(Boolean))];

  // 💡 LỌC RẠP THEO THÀNH PHỐ ĐƯỢC CHỌN
  const filteredTheaters = selectedCity === 'all'
    ? theaters
    : theaters.filter(t => (t.city === selectedCity || t.location === selectedCity));

  return (
    <div className="theaters-wrapper">
      <div className="theaters-header">
        <h1>{t('theaters.header.title') || "Hệ Thống Rạp"}</h1>
        <p>{t('theaters.header.subtitle') || "Hệ thống rạp chiếu phim hiện đại trên toàn quốc"}</p>

        {/* 💡 DROPDOWN CHỌN TỈNH THÀNH */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ padding: '10px 20px', borderRadius: '8px', background: '#1c1c24', color: '#fff', border: '1px solid #333', fontSize: '16px', outline: 'none', cursor: 'pointer', minWidth: '250px' }}
          >
            <option value="all">{t('theaters.filters.allCities') || "📍 -- Tất cả Tỉnh/Thành phố --"}</option>
            {cities.filter(c => c !== 'all').map((city, idx) => (
              <option key={idx} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="theaters-grid" style={{ marginTop: '30px' }}>
        {filteredTheaters.length > 0 ? filteredTheaters.map((theater, index) => {
          const fallbackImages = [
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=800&auto=format&fit=crop'
          ];
          const displayImage = theater.image || fallbackImages[index % 4];
          const displayAmenities = theater.amenities || ['IMAX', 'VIP Lounge', 'Dolby Atmos'];

          // Xử lý chuỗi địa chỉ hiển thị an toàn không bị lặp chữ
          const fullAddress = theater.location 
            ? (theater.city && !theater.location.includes(theater.city) ? `${theater.location}, ${theater.city}` : theater.location)
            : (theater.address || t('theaters.card.fallbackAddress') || "Đang cập nhật địa chỉ");

          return (
            <div className="theater-card" key={theater.theaterId || index}>
              <div className="theater-img-box">
                {displayAmenities.includes('IMAX') && (
                  <span className="theater-badge">IMAX</span>
                )}
                <img src={displayImage} alt={theater.name} />
              </div>

              <div className="theater-info">
                <h2 className="theater-name">{theater.name.startsWith('CinemaX') ? theater.name : `CinemaX ${theater.name}`}</h2>

                {/* Địa chỉ với Icon đồng bộ Figma */}
                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                  <img 
                    src={cinemaAddressIcon} 
                    alt="Address" 
                    style={{ width: '18px', height: '18px', objectFit: 'contain', marginTop: '2px' }} 
                  />
                  <span style={{ whiteSpace: 'pre-line', flex: 1 }}>
                    {fullAddress}
                  </span>
                </div>

                {/* Số điện thoại */}
                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <img 
                    src={phoneIcon} 
                    alt="Phone" 
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
                  />
                  <span>{theater.phone || t('theaters.card.fallbackPhone') || "1900 xxxx"}</span>
                </div>

                {/* Giờ hoạt động */}
                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={clockIcon} 
                    alt="Clock" 
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }} 
                  />
                  <span>{theater.operatingHours || t('theaters.card.fallbackHours') || "8:00 - 23:30 hàng ngày"}</span>
                </div>

                <div className="amenities-section">
                  <div className="amenities-title">{t('theaters.card.amenities') || "Tiện ích"}</div>
                  <div className="amenities-tags">
                    {displayAmenities.map((amenity, idx) => (
                      <span className="amenity-tag" key={idx}>
                        <span className="star">⭐</span> {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="theater-actions">
                  <button className="btn-primary-theater" onClick={() => handleViewSchedule(theater.theaterId)}>
                    {t('theaters.buttons.viewSchedule') || "Xem Lịch Chiếu"}
                  </button>
                  <button className="btn-secondary-theater" onClick={() => window.open(theater.mapLink || 'https://maps.google.com', '_blank')}>
                    {t('theaters.buttons.directions') || "Chỉ Đường"}
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ color: '#aaa', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
            {t('theaters.status.empty') || "Hiện chưa có cụm rạp nào tại khu vực này."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Theaters;