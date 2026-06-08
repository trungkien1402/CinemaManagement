import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PageHero from '../shared/PageHero';

import '../style/Theaters.css';

const Theaters = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const cities = ['all', ...new Set(theaters.map(t => t.city || t.location).filter(Boolean))];

  const filteredTheaters = selectedCity === 'all'
    ? theaters
    : theaters.filter(t => (t.city === selectedCity || t.location === selectedCity));

  return (
    <div className="theaters-page-container">
      <PageHero 
        title={t('theaters.header.title') || "Hệ Thống Rạp"}
        subtitle={t('theaters.header.subtitle') || "Hệ thống rạp chiếu phim hiện đại trên toàn quốc"}
      />
      <div className="theaters-wrapper" style={{ paddingTop: '0' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'flex-start' }}>
          {/* bỏ sạch style rác, chỉ dùng đúng classname này */}
          <select
            className="city-filter-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="all">{t('theaters.filters.allCities') || " Tất cả Tỉnh/Thành phố --"}</option>
            {cities.filter(c => c !== 'all').map((city, idx) => (
              <option key={idx} value={city}>{city}</option>
            ))}
          </select>
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

                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#ff2c1f', fontSize: '16px', marginTop: '4px', width: '18px', textAlign: 'center' }}></i>
                  <span style={{ whiteSpace: 'pre-line', flex: 1 }}>
                    {fullAddress}
                  </span>
                </div>

                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <i className="fa-solid fa-phone" style={{ color: '#ff2c1f', fontSize: '15px', width: '18px', textAlign: 'center' }}></i>
                  <span>{theater.phone || t('theaters.card.fallbackPhone') || "1900 xxxx"}</span>
                </div>

                <div className="theater-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-regular fa-clock" style={{ color: '#ff2c1f', fontSize: '15px', width: '18px', textAlign: 'center' }}></i>
                  <span>{theater.operatingHours || t('theaters.card.fallbackHours') || "8:00 - 23:30 hàng ngày"}</span>
                </div>

                <div className="amenities-section">
                  <div className="amenities-title">{t('theaters.card.amenities') || "Tiện ích"}</div>
                  <div className="amenities-tags">
                    {displayAmenities.map((amenity, idx) => (
                      <span className="amenity-tag" key={idx}>
                        <i className="fa-solid fa-star star" style={{ color: '#ffc107', marginRight: '4px' }}></i> {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="theater-actions">
                  <button className="btn-primary-theater" onClick={() => handleViewSchedule(theater.theaterId)}>
                    {t('theaters.buttons.viewSchedule') || "Xem Lịch Chiếu"}
                  </button>
                  <button className="btn-secondary-theater" onClick={() => window.open(theater.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((theater.name.startsWith('CinemaX') ? theater.name : 'CinemaX ' + theater.name) + ' ' + fullAddress)}`, '_blank')}>
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
  </div>
);
};

export default Theaters;