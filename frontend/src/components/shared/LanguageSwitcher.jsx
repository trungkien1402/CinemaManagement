import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false); // Xổ xong thì tự động đóng lại
  };

  const currentLng = i18n.language || 'vi';

  // 💡 MẢNG NGÔN NGỮ: Ông muốn thêm bao nhiêu nước thì cứ ném vào đây
  const languages = [
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
    { code: 'en', flag: '🇬🇧', name: 'English' }
  ];

  // Tìm ngôn ngữ đang được active để hiện lên nút chính
  const activeLang = languages.find(l => currentLng.startsWith(l.code)) || languages[0];

  // Logic click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styles = {
    wrapper: {
      position: 'relative',
      display: 'inline-block'
    },
    activeBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: '#1c1c24',
      border: '1px solid #33333d',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '18px',
      cursor: 'pointer',
      color: '#fff',
      transition: 'all 0.3s ease',
      boxShadow: isOpen ? '0 0 8px rgba(255, 77, 77, 0.4)' : 'none'
    },
    dropdown: {
      position: 'absolute',
      top: '120%',
      right: 0,
      background: '#1c1c24',
      border: '1px solid #33333d',
      borderRadius: '12px',
      padding: '8px 0',
      minWidth: '150px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
      // 💡 ĐÂY LÀ CHỖ TẠO SCROLL
      maxHeight: '160px', 
      overflowY: 'auto',
      zIndex: 1000,
      display: isOpen ? 'block' : 'none'
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      background: isActive ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
      color: isActive ? '#ff4d4d' : '#fff',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: isActive ? 'bold' : 'normal',
      transition: 'background 0.2s',
    })
  };

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      {/* NÚT HIỂN THỊ CHÍNH TRÊN NAVBAR */}
      <button
        style={styles.activeBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Chọn ngôn ngữ"
      >
        <span>{activeLang.flag}</span>
        {/* Nếu ông có dùng FontAwesome thì mở comment dòng dưới để hiện mũi tên */}
        {/* <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', opacity: 0.7 }}></i> */}
      </button>

      {/* DANH SÁCH DROPDOWN CÓ SCROLL */}
      <div style={styles.dropdown} className="lang-scroll-menu">
        {languages.map((lang) => (
          <button
            key={lang.code}
            style={styles.item(currentLng.startsWith(lang.code))}
            onClick={() => changeLanguage(lang.code)}
          >
            <span style={{ fontSize: '18px', lineHeight: '1' }}>{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
      
      {/* 💡 CSS Tùy chỉnh làm đẹp thanh cuộn */}
      <style>{`
        .lang-scroll-menu::-webkit-scrollbar {
          width: 5px;
        }
        .lang-scroll-menu::-webkit-scrollbar-thumb {
          background: #ff4d4d;
          border-radius: 10px;
        }
        .lang-scroll-menu::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .lang-scroll-menu button:hover {
          background: rgba(255, 77, 77, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;