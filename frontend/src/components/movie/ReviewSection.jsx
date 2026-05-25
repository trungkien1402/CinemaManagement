import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// 💡 1. THÊM PROP onReviewsUpdate ĐỂ TRUYỀN DỮ LIỆU LÊN CHA
const ReviewSection = ({ movieId, onReviewsUpdate }) => {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // TỰ ĐỘNG LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP (Từ LocalStorage)
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const fetchReviews = () => {
        axios.get(`http://localhost:8080/api/reviews/movie/${movieId}`)
            .then(res => {
                // 💡 MẸO: Thêm .reverse() để lật ngược mảng, đẩy bài mới nhất lên đầu
                const reversedData = res.data.reverse();

                setReviews(reversedData);

                if (onReviewsUpdate) {
                    onReviewsUpdate(reversedData);
                }
            })
            .catch(err => console.error("Lỗi tải bình luận:", err));
    };

    useEffect(() => {
        if (movieId) {
            fetchReviews();
        }
    }, [movieId]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Chặn nếu khách vãng lai chưa đăng nhập
        if (!currentUser) {
            alert(t('detail.reviews.alerts.loginRequired') || "Vui lòng đăng nhập để bình luận!");
            return;
        }

        if (!comment.trim()) {
            alert(t('detail.reviews.alerts.emptyComment') || "Bạn chưa nhập nội dung bình luận kìa!");
            return;
        }

        setIsSubmitting(true);

        // GẮN TRỰC TIẾP ID CỦA TÀI KHOẢN ĐANG ĐĂNG NHẬP VÀO LỆNH GỬI
        const payload = {
            movie: { movieId: Number(movieId) },
            user: { userId: Number(currentUser.userId || currentUser.id) },
            rating: rating,
            comment: comment
        };

        axios.post('http://localhost:8080/api/reviews', payload)
            .then(() => {
                setComment('');
                setRating(5);
                fetchReviews();
            })
            .catch(err => {
                console.error("Lỗi gửi bình luận:", err);
                alert(t('detail.reviews.alerts.submitError') || "Lỗi khi đăng bình luận! Xem lại console nhé.");
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className="detail-reviews-section" style={{ marginTop: '50px', background: '#111116', padding: '30px', borderRadius: '16px' }}>
            <h2 className="detail-main-title" style={{ color: 'white', borderLeft: '4px solid #ff3333', paddingLeft: '10px', marginBottom: '20px' }}>
                {t('detail.reviews.title') || "Bình Luận & Đánh Giá"}
            </h2>

            {/* NẾU CHƯA ĐĂNG NHẬP THÌ ẨN FORM, HIỆN THÔNG BÁO BẮT ĐĂNG NHẬP */}
            {!currentUser ? (
                <div style={{ background: '#1c1c24', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#aaa', marginBottom: '30px' }}>
                    {t('detail.reviews.loginPrompt.text1') || "Bạn cần "} 
                    <strong>{t('detail.reviews.loginPrompt.boldText') || "Đăng nhập"}</strong> 
                    {t('detail.reviews.loginPrompt.text2') || " để có thể viết bình luận cho bộ phim này."}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="review-input-box" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Hiện tên người đang đăng nhập cho oai */}
                        <span style={{ color: '#aaa' }}>
                            {t('detail.reviews.form.yourRating', { name: currentUser.username || currentUser.fullName || "User" }) || `Đánh giá của bạn (${currentUser.username || currentUser.fullName || "User"}):`}
                        </span>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            style={{ padding: '5px 10px', background: '#1c1c24', color: '#ffc107', border: '1px solid #333', borderRadius: '4px', outline: 'none' }}
                        >
                            <option value={5}>⭐⭐⭐⭐⭐ ({t('detail.reviews.ratingLabels.excellent') || "Tuyệt vời"})</option>
                            <option value={4}>⭐⭐⭐⭐ ({t('detail.reviews.ratingLabels.veryGood') || "Rất hay"})</option>
                            <option value={3}>⭐⭐⭐ ({t('detail.reviews.ratingLabels.good') || "Khá ổn"})</option>
                            <option value={2}>⭐⭐ ({t('detail.reviews.ratingLabels.fair') || "Tạm được"})</option>
                            <option value={1}>⭐ ({t('detail.reviews.ratingLabels.poor') || "Tệ"})</option>
                        </select>
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('detail.reviews.form.placeholder') || "Chia sẻ cảm nghĩ của bạn về bộ phim này..."}
                        style={{ width: '100%', padding: '15px', borderRadius: '8px', background: '#1c1c24', border: '1px solid #333', color: 'white', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ alignSelf: 'flex-end', background: isSubmitting ? '#555' : '#ff3333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: '0.3s' }}
                    >
                        {isSubmitting ? (t('detail.reviews.buttons.submitting') || "Đang gửi...") : (t('detail.reviews.buttons.submit') || "Gửi Bình Luận")}
                    </button>
                </form>
            )}

            {/* Danh sách hiển thị bình luận */}
            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>{t('detail.reviews.list.empty') || "Chưa có bình luận nào. Hãy là người đầu tiên đánh giá phim này!"}</p>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.reviewId} className="review-item" style={{ background: '#1c1c24', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong style={{ color: '#fff' }}>{rev.user?.fullName || rev.user?.username || t('detail.reviews.list.anonymous')}</strong>
                                <span style={{ color: '#ffc107' }}>
                                    {"⭐".repeat(rev.rating)}
                                </span>
                            </div>
                            <p style={{ color: '#ccc', margin: 0, lineHeight: '1.5' }}>{rev.comment}</p>
                            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', display: 'block' }}>
                                {new Date(rev.createdAt).toLocaleDateString(i18n.language.startsWith('en') ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;