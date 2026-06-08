import React from 'react';
import { useTranslation } from 'react-i18next';

const MovieSchedule = ({
  datesData,
  selectedDate,
  setSelectedDate,
  selectedProvince,
  handleProvinceChange,
  uniqueProvinces,
  selectedTheater,
  setSelectedTheater,
  filteredTheaters,
  theaterGroups,
  navigate
}) => {
  const { t } = useTranslation();

  return (
    <div className="detail-schedule-wrapper" id="detail-schedule-section">
      <h2 className="detail-main-title">{t('home.schedule.title') || "Lịch Chiếu"}</h2>

      {/* DATE SELECTION ROW */}
      <div className="detail-date-row">
        {datesData.map((d) => (
          <div
            key={d.date}
            className={`detail-date-box ${selectedDate === d.date ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.date)}
          >
            <span className="detail-day-text">{d.day}</span>
            <span className="detail-date-text">{d.label}</span>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="theaters-filter-bar" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', background: '#1c1c24', padding: '15px 20px', borderRadius: '12px', border: '1px solid #2a2a35' }}>
        <span className="filter-label" style={{ color: '#fff', fontWeight: 'bold' }}> {t('detail.schedule.filterLabel') || "Lọc rạp chiếu:"}</span>
        
        <select
          className="filter-select"
          value={selectedProvince}
          onChange={handleProvinceChange}
          style={{ padding: '8px 12px', background: '#222228', color: '#fff', border: '1px solid #33333d', borderRadius: '8px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="">{t('detail.schedule.selectProvince') || "-- Chọn Tỉnh Thành --"}</option>
          {uniqueProvinces.map((prov, index) => (
            <option key={index} value={prov}>{prov}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedTheater}
          onChange={(e) => setSelectedTheater(e.target.value)}
          disabled={!selectedProvince}
          style={{
            padding: '8px 12px',
            background: selectedProvince ? '#222228' : '#111115',
            color: selectedProvince ? '#fff' : '#666',
            border: '1px solid #33333d',
            borderRadius: '8px',
            cursor: selectedProvince ? 'pointer' : 'not-allowed',
            outline: 'none'
          }}
        >
          {!selectedProvince ? (
            <option value="all">{t('detail.schedule.selectProvinceFirst') || "Vui lòng chọn tỉnh trước"}</option>
          ) : (
            <option value="all">{t('home.schedule.filters.allTheaters') || "-- Tất Cả Rạp --"}</option>
          )}
          {filteredTheaters.map((theater) => {
            const tId = theater.theaterId || theater.theater_id || theater.id;
            return <option key={tId} value={tId}>{theater.name}</option>;
          })}
        </select>
      </div>

      {/* THEATERS GRID LIST */}
      <div className="detail-theaters-list">
        {Object.keys(theaterGroups).length > 0 ? (Object.values(theaterGroups).map((theater, idx) => (
            <div key={idx} className="detail-theater-card-block">
              <h3 className="detail-theater-name">CinemaX {theater.name}</h3>
              <p className="detail-theater-address">
                <i className="fa-solid fa-location-dot" style={{ color: '#ff2c1f', marginRight: '6px' }}></i>
                {theater.address}
              </p>

              <div className="detail-slots-grid">
                {theater.slots
                  .slice()
                  .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
                  .map((slot) => {
                    const rawTime = slot.startTime || slot.start_time;
                    const formattedTime = typeof rawTime === 'string' ? rawTime.substring(0, 5) : '00:00';

                    return (
                      <button
                        key={slot.showtimeId}
                        className="detail-time-slot-btn"
                        onClick={() => navigate(`/dat-ve/${slot.showtimeId}`)}
                      >
                        <span className="slot-time">{formattedTime}</span>
                        <span className="slot-type">2D • Live</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="detail-no-data" style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            {t('detail.schedule.noData') || "Rất tiếc, phim không có suất chiếu nào vào ngày và rạp đã chọn."}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSchedule;