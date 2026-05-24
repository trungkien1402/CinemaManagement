import React from 'react';

const MoviesTab = ({ movieForm, setMovieForm, saveOrUpdateMovie, editingMovieId, movies, triggerEditMovie, deleteMovieObj }) => {
    return (
        <div className="tab-view">
            <h2 className="tab-title">Kho Lưu Trữ Phim Điện Ảnh</h2>
            <form onSubmit={saveOrUpdateMovie} className="interactive-form-grid">
                <input type="text" placeholder="Tên phim điện ảnh" value={movieForm.title || ''} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
                <input type="text" placeholder="Thể loại (Hành động, Tình cảm...)" value={movieForm.genre || ''} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} />
                <input type="number" placeholder="Thời lượng (Phút)" value={movieForm.duration || ''} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} />
                <input type="text" placeholder="Đạo diễn / Tác giả" value={movieForm.author || ''} onChange={e => setMovieForm({...movieForm, author: e.target.value})} />
                <input type="text" placeholder="Đường dẫn ảnh Poster" value={movieForm.image || ''} onChange={e => setMovieForm({...movieForm, image: e.target.value})} />
                <input type="text" placeholder="Đường dẫn Trailer YouTube" value={movieForm.trailerUrl || ''} onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} />
                <input type="date" value={movieForm.releaseDate || ''} onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})} />

                <select value={movieForm.movieFormat || '2D'} onChange={e => setMovieForm({...movieForm, movieFormat: e.target.value})}>
                    <option value="2D">Định dạng 2D</option>
                    <option value="3D">Định dạng 3D</option>
                    <option value="IMAX">Định dạng IMAX</option>
                </select>
                
                <select value={movieForm.ageRating || 'P'} onChange={e => setMovieForm({...movieForm, ageRating: e.target.value})}>
                    <option value="P">P - Mọi lứa tuổi</option>
                    <option value="T13">T13 - Từ 13 tuổi</option>
                    <option value="T16">T16 - Từ 16 tuổi</option>
                    <option value="T18">T18 - Phim giới hạn 18+</option>
                </select>
                
                {/* ✅ ĐÃ ĐẢO ĐÚNG LOGIC: 1 là Đang chiếu, 2 là Sắp chiếu */}
                <select value={String(movieForm.status !== undefined && movieForm.status !== null ? movieForm.status : "1")} 
                        onChange={e => setMovieForm({...movieForm, status: e.target.value})}>
                    <option value="1">Trạng thái: Đang chiếu</option>
                    <option value="2">Trạng thái: Sắp chiếu</option>
                    <option value="0">Trạng thái: Ngưng chiếu</option>
                </select>

                <textarea className="full-width-field" placeholder="Tóm tắt cốt truyện phim..." value={movieForm.description || ''} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
                <button type="submit" className="form-submit-btn-main">{editingMovieId ? "💾 Cập Nhật Phim" : "➕ Thêm Phim Mới"}</button>
            </form>
            
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr><th>Mã Phim</th><th>Hình ảnh</th><th>Tên Phim</th><th>Định dạng</th><th>Độ tuổi</th><th>Trạng thái</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                        {movies.map(m => (
                            <tr key={m.movieId}>
                                <td>#{m.movieId}</td>
                                <td><img src={m.image} alt="" className="table-thumbnail-img" /></td>
                                <td><strong>{m.title}</strong></td>
                                <td><span className="badge-format">{m.movieFormat}</span></td>
                                <td><span className="badge-age">{m.ageRating}</span></td>
                                <td>
                                    {/* ✅ ĐÃ ĐẢO ĐÚNG TAG MÀU SẮC THEO ĐỊNH NGHĨA MỚI */}
                                    {String(m.status) === "1" && <span className="badge-status-green">Đang chiếu</span>}
                                    {String(m.status) === "2" && <span className="badge-status-yellow">Sắp chiếu</span>}
                                    {String(m.status) === "0" && <span className="badge-status-red">Ngưng chiếu</span>}
                                </td>
                                <td>
                                    <button onClick={() => triggerEditMovie(m)} className="control-btn btn-edit-sm">Sửa</button>
                                    <button onClick={() => deleteMovieObj(m.movieId)} className="control-btn btn-delete-sm">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MoviesTab;