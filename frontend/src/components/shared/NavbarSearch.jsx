import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../style/NavbarSearch.css';

const NavbarSearch = () => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Xử lý tự động gọi API khi người dùng gõ chữ (Debounce 300ms)
  useEffect(() => {
    if (keyword.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      axios.get(`http://localhost:8080/api/public/movies/search?keyword=${keyword}`)
        .then(res => {
          setResults(Array.isArray(res.data) ? res.data : []);
        })
        .catch(err => console.error("Lỗi tìm kiếm phim:", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  // Click ra ngoài thanh tìm kiếm thì đóng dropdown gợi ý lại
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ️ xử lý chuyển hướng khi click vào phim
  const handleSelectMovie = (movieId) => {
    setKeyword(''); // Reset ô nhập liệu về rỗng
    setShowDropdown(false); // Đóng ngay menu đổ xuống
    
    // Điều hướng sang trang chi tiết phim. 
    // CHÚ Ý: Đổi chữ '/phim/' thành đường dẫn khớp với config trong Route của bạn (Ví dụ: /movie/ hoặc /phim/)
    navigate(`/phim/${movieId}`); 
  };

  return (
    <div className="navbar-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={t('nav.search.placeholder') || "Tìm tên phim..."}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => keyword.trim().length > 0 && setShowDropdown(true)}
        />
        <span className="search-icon"></span>
      </div>

      {/* Thả xuống danh sách kết quả gợi ý nhanh */}
      {showDropdown && keyword.trim().length >= 1 && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="no-result">{t('nav.search.noResult') || "Không tìm thấy phim nào 😢"}</div>
          ) : (
            results.map(movie => (
              <div 
                key={movie.movieId || movie.id} 
                className="search-result-item"
                onClick={() => handleSelectMovie(movie.movieId || movie.id)}
              >
                <img 
                  src={movie.image || movie.poster || 'https://via.placeholder.com/40x60'} 
                  alt={movie.title} 
                  className="search-item-img"
                />
                <div className="search-item-info">
                  <p className="search-item-title">{movie.title}</p>
                  <span className="search-item-meta">
                    {movie.genre ? (t(`genres.${movie.genre.split(',')[0].trim()}`) || movie.genre.split(',')[0].trim()) : (t('nav.search.movieDefault') || 'Phim')} • {movie.duration} {t('nav.search.minutes') || 'phút'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;