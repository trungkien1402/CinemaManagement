import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import '../style/News.css';

const NewsPage = () => {

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
                        TIN TỨC ĐIỆN ẢNH
                    </h1>

                    <p>
                        Cập nhật phim mới, trailer, review và thế giới điện ảnh
                    </p>

                </div>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="loading">
                    Đang tải tin tức...
                </div>
            )}

            {/* NEWS GRID */}
            <div className="news-container">

                {news.map((item, index) => (

                    <div
                        className="news-card"
                        key={index}
                    >

                        <div className="news-image">

                            <img
                                src={item.image}
                                alt={item.title}
                            />

                            <div className="news-date">
                                {item.pubDate}
                            </div>

                        </div>

                        <div className="news-content">

                            <h2>
                                {item.title}
                            </h2>

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
                                Xem chi tiết →
                            </a>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default NewsPage;