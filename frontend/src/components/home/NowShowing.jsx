import MovieCard from '../shared/MovieCard';
import './stylepage/NowShowing.css';

const NowShowing = () => {
    const listMovies = [
        {
        movie_id: "M001",
        title: "Bóng Đêm Huyền Bí",
        genre: "Hành động, Phiêu lưu",
        duration: 142,
        release_date: "2024-11-14",
        author: "Christopher Nolan",
        image: "https://tse2.mm.bing.net/th/id/OIP._NO16bHpajT640nmHhgeoAHaHa?rs=1&pid=ImgDetMain"
        },
        {
        movie_id: "M002",
        title: "Kẻ Hủy Diệt: Kỷ Nguyên Mới",
        genre: "Khoa học viễn tưởng",
        duration: 120,
        release_date: "2024-05-20",
        author: "James Cameron",
        image: "" // Test ảnh lỗi
        },
        {
        movie_id: "M003",
        title: "Hào Quang Rực Rỡ",
        genre: "Tâm lý, Chính kịch",
        duration: 115,
        release_date: "2024-04-10",
        author: "Trấn Thành",
        image: "https://via.placeholder.com/400x600" 
        },
        {
        movie_id: "M004", 
        title: "Vây Hãm: Không Lối Thoát",
        genre: "Hành động, Tội phạm",
        duration: 105,
        release_date: "2023-05-31",
        author: "Lee Sang-yong",
        image: "https://th.bing.com/th/id/OIP.48o5i11OBNxUR5tK7C8ARQHaEK?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"
        }
    ];
    return (
        <div className="section-header-nowshowing">
            <h2 className="title-nowshowing"> Phim Đang Chiếu  </h2>
           
            <div className="movie-grid">
                      {listMovies.map((movie) => (
                        <MovieCard key={movie.movie_id} movie={movie} />
                      ))}
            </div>
        </div>
    );
    
};
export default NowShowing;