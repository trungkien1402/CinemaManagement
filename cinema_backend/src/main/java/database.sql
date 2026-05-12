

INSERT INTO cinema.movies (title, status, description, duration, genre, age_rating, release_date, image, author)
VALUES
    ('Lật Mặt 7: Một Điều Ước', 1, 'Câu chuyện về tình thân gia đình của bà Hai và 5 người con.', 138, 'Gia đình, Tâm lý', 'K', '2024-04-26', 'https://tse4.mm.bing.net/th/id/OIP.PpAna9oFhPNmD3GHeGTjhQHaLH?pid=ImgDetMain', 'Lý Hải'),

    ('Doraemon: Bản Tình Ca Nobita', 1, 'Nobita và các bạn tham gia vào cuộc phiêu lưu âm nhạc mới.', 115, 'Hoạt hình, Phiêu lưu', 'P', '2024-05-24', 'https://tse1.mm.bing.net/th/id/OIP.uY6S-KxHlR7Cj0f-YV_2jAHaK7?pid=ImgDetMain', 'Kazuaki Imai'),

    ('Haikyu!!: Trận Chiến Bãi Phế Liệu', 1, 'Trận đấu định mệnh giữa trường Karasuno và Nekoma.', 85, 'Hoạt hình, Thể thao', 'T13', '2024-05-17', 'https://tse2.mm.bing.net/th/id/OIP.T6Vq8Xm7kYlU4p_n3-6NfQHaK5?pid=ImgDetMain', 'Susumu Mitsunaka'),

    ('Deadpool & Wolverine', 0, 'Sự kết hợp bùng nổ giữa hai siêu anh hùng lầy lội nhất Marvel.', 127, 'Hành động, Hài hước', 'T18', '2024-07-26', 'https://tse3.mm.bing.net/th/id/OIP.FwF_cf0dSqOU07LopUKXgwHaLZ?pid=ImgDetMain', 'Shawn Levy'),

    ('Despicable Me 4', 0, 'Gru và gia đình đối mặt với kẻ thù mới cùng những chú Minion tinh nghịch.', 95, 'Hoạt hình, Hài', 'P', '2024-07-03', 'https://tse2.mm.bing.net/th/id/OIP.3YQ_E3zK9-vG0n3W8z-mOAHaK9?pid=ImgDetMain', 'Chris Renaud');

-- Kiểm tra lại dữ liệu
SELECT * FROM cinema.movies;

SELECT * FROM cinema.users;

DROP TABLE IF EXISTS cinema.users;




