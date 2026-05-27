import React from 'react';
import playButtonIcon from '../../assets/play-button.png';
import { useTranslation } from 'react-i18next';

const MovieTrailer = ({ movie }) => {
  const { t } = useTranslation();


  console.log("=== DỮ LIỆU PHIM NHẬN ĐƯỢC TỪ BACKEND ===", movie);

  // Hàm bổ trợ: Tự động trích xuất YouTube Video ID từ bất kỳ định dạng link nào Admin nhập
  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;

    const trimmedUrl = url.trim();

    // Nếu Admin chỉ nhập đúng 11 ký tự ID (Ví dụ: dQw4w9WgXcQ) thay vì cả đường link
    if (trimmedUrl.length === 11) {
      return trimmedUrl;
    }

    // Biểu thức chính quy (Regex) quét mọi định dạng link YouTube (watch?v=, shorts/, embed/, share link,...)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmedUrl.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
  };

  // QUÉT ĐA NĂNG: Thử lấy dữ liệu từ tất cả các tên trường có thể có từ Backend
  const rawTrailerUrl = movie?.trailerUrl;

  const videoId = getYouTubeId(rawTrailerUrl);

  return (
    <div className="detail-trailer-section" style={{ margin: '50px 0' }}>
      <h2 className="detail-section-title" style={{ marginBottom: '20px' }}>
        {t('detail.trailer.title') || "Trailer Phim"}
      </h2>

      {videoId ? (

        <div className="detail-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={movie?.title || "Movie Trailer"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : rawTrailerUrl ? (

        <div className="detail-video-placeholder" style={{ border: '1px dashed #ff4d4d', padding: '30px' }}>
          <span style={{ color: '#ff4d4d', fontSize: '16px', fontWeight: 'bold' }}>
            Định dạng link Trailer từ Admin nhập không hợp lệ!
          </span>
          <p style={{ color: '#aaa', fontSize: '13px', marginTop: '10px' }}>
            Giá trị hiện tại: "{rawTrailerUrl}"
          </p>
        </div>
      ) : (

        <div className="detail-video-placeholder">
          <img src={playButtonIcon} alt="Play Icon" />
<span>{t('detail.trailer.updating') || "Trailer đang cập nhật..."}</span>
        </div>
      )}
    </div>
  );
};

export default MovieTrailer;