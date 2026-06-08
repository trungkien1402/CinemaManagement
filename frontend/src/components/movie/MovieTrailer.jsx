import React from 'react';
import playButtonIcon from '../../assets/play-button.png';
import { useTranslation } from 'react-i18next';

const MovieTrailer = ({ movie }) => {
  const { t } = useTranslation();
  const rawTrailerUrl = movie?.trailerUrl;
  const isMp4 = rawTrailerUrl && rawTrailerUrl.toLowerCase().includes('.mp4');

  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 11) return trimmedUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmedUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = getYouTubeId(rawTrailerUrl);

  return (
    <div className="detail-trailer-section" style={{ margin: '50px 0' }}>
      <h2 className="detail-section-title">{t('detail.trailer.title') || "Trailer Phim"}</h2>

      {isMp4 ? (
        // MP4 hiển thị bó sát, không viền đen
        <div className="detail-video-container" style={{ paddingBottom: 0, height: 'auto', border: 'none', background: 'transparent' }}>
          <video controls style={{ width: '100%', maxHeight: '500px', display: 'block', borderRadius: '16px', background: '#000' }}>
            <source src={rawTrailerUrl} type="video/mp4" />
          </video>
        </div>
      ) : videoId ? (
        // YouTube giữ nguyên tỷ lệ 16:9
        <div className="detail-video-container">
          <iframe src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen />
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