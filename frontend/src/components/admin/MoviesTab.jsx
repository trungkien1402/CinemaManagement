import React from 'react';
import { useTranslation } from 'react-i18next'; 
import '../style/MovieTab.css';

const MoviesTab = ({ movieForm, setMovieForm, saveOrUpdateMovie, editingMovieId, movies, triggerEditMovie, deleteMovieObj }) => {
    const { t } = useTranslation(); 

    return (
        <div className="mvtab-container tab-view">
            <h2 className="mvtab-main-title tab-title">
                {t('admin.adminDashboard.moviesTab.title') || "Kho Lưu Trữ Phim Điện Ảnh"}
            </h2>
            
            {/* Form nhập thông tin phim dạng Grid */}
            <form onSubmit={saveOrUpdateMovie} className="mvtab-interactive-grid interactive-form-grid">
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.title') || "Tên phim điện ảnh"} 
                    value={movieForm.title || ''} 
                    onChange={e => setMovieForm({...movieForm, title: e.target.value})} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.genre') || "Thể loại (Hành động, Tình cảm...)"} 
                    value={movieForm.genre || ''} 
                    onChange={e => setMovieForm({...movieForm, genre: e.target.value})} 
                />
                <input 
                    type="number" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.duration') || "Thời lượng (Phút)"} 
                    value={movieForm.duration || ''} 
                    onChange={e => setMovieForm({...movieForm, duration: e.target.value})} 
                />
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.author') || "Đạo diễn / Tác giả"} 
                    value={movieForm.author || ''} 
                    onChange={e => setMovieForm({...movieForm, author: e.target.value})} 
                />
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.image') || "Đường dẫn ảnh Poster"} 
                    value={movieForm.image || ''} 
                    onChange={e => setMovieForm({...movieForm, image: e.target.value})} 
                />
                <input 
                    type="text" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.trailerUrl') || "Đường dẫn Trailer YouTube"} 
                    value={movieForm.trailerUrl || ''} 
                    onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} 
                />
                <input 
                    type="date" 
                    value={movieForm.releaseDate || ''} 
                    onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})} 
                />

                <select value={movieForm.movieFormat || '2D'} onChange={e => setMovieForm({...movieForm, movieFormat: e.target.value})}>
                    <option value="2D">{t('admin.adminDashboard.moviesTab.form.options.formats.2d') || "2D"}</option>
                    <option value="3D">{t('admin.adminDashboard.moviesTab.form.options.formats.3d') || "3D"}</option>
                    <option value="IMAX">{t('admin.adminDashboard.moviesTab.form.options.formats.imax') || "IMAX"}</option>
                </select>
                
                <select value={movieForm.ageRating || 'P'} onChange={e => setMovieForm({...movieForm, ageRating: e.target.value})}>
                    <option value="P">{t('admin.adminDashboard.moviesTab.form.options.age.p') || "P - Phổ biến"}</option>
                    <option value="T13">{t('admin.adminDashboard.moviesTab.form.options.age.t13') || "T13 - Trên 13 tuổi"}</option>
                    <option value="T16">{t('admin.adminDashboard.moviesTab.form.options.age.t16') || "T16 - Trên 16 tuổi"}</option>
                    <option value="T18">{t('admin.adminDashboard.moviesTab.form.options.age.t18') || "T18 - Trên 18 tuổi"}</option>
                </select>
                
                <select value={String(movieForm.status !== undefined && movieForm.status !== null ? movieForm.status : "1")} 
                        onChange={e => setMovieForm({...movieForm, status: e.target.value})}>
                    <option value="1">{t('admin.adminDashboard.moviesTab.form.options.status.showing') || "Đang chiếu"}</option>
                    <option value="2">{t('admin.adminDashboard.moviesTab.form.options.status.upcoming') || "Sắp chiếu"}</option>
                    <option value="0">{t('admin.adminDashboard.moviesTab.form.options.status.stopped') || "Ngưng chiếu"}</option>
                </select>

                <textarea 
                    className="mvtab-full-width full-width-field" 
                    placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.description') || "Tóm tắt cốt truyện phim..."} 
                    value={movieForm.description || ''} 
                    onChange={e => setMovieForm({...movieForm, description: e.target.value})} 
                />
                
                <button type="submit" className="mvtab-submit-btn form-submit-btn-main">
                    {editingMovieId 
                        ? `💾 ${t('admin.adminDashboard.moviesTab.form.buttons.update') || "Cập Nhật Phim"}` 
                        : `➕ ${t('admin.adminDashboard.moviesTab.form.buttons.create') || "Thêm Phim Mới"}`
                    }
                </button>
            </form>
            
            {/* Bảng danh sách phim */}
            <div className="mvtab-table-responsive table-responsive-box">
                <table className="mvtab-data-table data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.moviesTab.table.movieId') || "Mã Phim"}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.image') || "Hình ảnh"}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.title') || "Tên Phim"}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.format') || "Định dạng"}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.age') || "Độ tuổi"}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.status') || "Trạng Thái"}</th> 
                            <th>{t('admin.adminDashboard.moviesTab.table.actions') || "Hành động"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map(m => (
                            <tr key={m.movieId}>
                                <td><code className="mvtab-id-code invoice-code">#{m.movieId}</code></td>
                                <td>
                                    <img 
                                        src={m.image && m.image.trim() !== "" ? m.image : "https://placehold.co/400x600?text=No+Poster"} 
                                        alt="Poster" 
                                        className="mvtab-thumbnail-img" 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "https://placehold.co/400x600?text=Error+Image";
                                        }}
                                    />
                                </td>
                                <td className="mvtab-movie-title"><strong>{m.title}</strong></td>
                                <td><span className="mvtab-badge-format">{m.movieFormat}</span></td>
                                <td><span className="mvtab-badge-age">{m.ageRating}</span></td>
                                <td>
                                    {String(m.status) === "1" && <span className="mvtab-status-badge green badge-status-green">{t('admin.adminDashboard.moviesTab.form.options.status.showing') || "Đang chiếu"}</span>}
                                    {String(m.status) === "2" && <span className="mvtab-status-badge yellow badge-status-yellow">{t('admin.adminDashboard.moviesTab.form.options.status.upcoming') || "Sắp chiếu"}</span>}
                                    {String(m.status) === "0" && <span className="mvtab-status-badge red badge-status-red">{t('admin.adminDashboard.moviesTab.form.options.status.stopped') || "Ngưng chiếu"}</span>}
                                </td>
                                <td>
                                    <div className="mvtab-action-group">
                                        <button onClick={() => triggerEditMovie(m)} className="mvtab-action-btn edit control-btn btn-edit-sm">
                                            {t('admin.adminDashboard.moviesTab.table.editBtn') || "Sửa"}
                                        </button>
                                        <button onClick={() => deleteMovieObj(m.movieId)} className="mvtab-action-btn delete control-btn btn-delete-sm">
                                            {t('admin.adminDashboard.moviesTab.table.deleteBtn') || "Xóa"}
                                        </button>
                                    </div>
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