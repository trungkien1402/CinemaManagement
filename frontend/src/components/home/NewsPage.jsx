import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import '../style/News.css';
import { useTranslation } from 'react-i18next';

const NewsPage = () => {
    const { t } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {

        try {

            const res = await api.get('/news');

            setNews(res.data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="news-page">

            {/* HERO */}
            <div className="news-hero">

                <div className="overlay"></div>

                <div className="hero-content">

                    <h1>
                        {t('home.news.hero.title') || "TIN TỨC ĐIỆN ẢNH"}
                    </h1>

                    <p>
                        {t('home.news.hero.subtitle') || "Cập nhật phim mới, trailer, review và thế giới điện ảnh"}
                    </p>

                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="loading">
                    {t('home.news.status.loading') || "Đang tải tin tức..."}
                </div>
            )}

            {/* NEWS GRID */}
            <div className="news-container">

                {news.map((item, index) => (

                    <div
                        className="news-card"
                        key={index}
                    >


                        <div className="news-content">

                            <div
                                className="news-description"
                                dangerouslySetInnerHTML={{
                                    __html: item.description
                                }}
                            />

                            <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="read-more"
                            >
                                {t('home.news.buttons.readMore') || "Xem chi tiết →"}
                            </a>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default NewsPage;