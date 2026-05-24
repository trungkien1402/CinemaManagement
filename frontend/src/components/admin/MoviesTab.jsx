import React from 'react';
import { useTranslation } from 'react-i18next'; 

const MoviesTab = ({ movieForm, setMovieForm, saveOrUpdateMovie, editingMovieId, movies, triggerEditMovie, deleteMovieObj }) => {
    const { t } = useTranslation(); 

    return (
        <div className="tab-view">
            <h2 className="tab-title">{t('admin.adminDashboard.moviesTab.title')}</h2>
            <form onSubmit={saveOrUpdateMovie} className="interactive-form-grid">
                {/* Đã giữ nguyên logic fallback || '' từ code mới để chống lỗi uncontrol input */}
                <input type="text" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.title')} value={movieForm.title || ''} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
                <input type="text" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.genre')} value={movieForm.genre || ''} onChange={e => setMovieForm({...movieForm, genre: e.target.value})} />
                <input type="number" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.duration')} value={movieForm.duration || ''} onChange={e => setMovieForm({...movieForm, duration: e.target.value})} />
                <input type="text" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.author')} value={movieForm.author || ''} onChange={e => setMovieForm({...movieForm, author: e.target.value})} />
                <input type="text" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.image')} value={movieForm.image || ''} onChange={e => setMovieForm({...movieForm, image: e.target.value})} />
                <input type="text" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.trailerUrl')} value={movieForm.trailerUrl || ''} onChange={e => setMovieForm({...movieForm, trailerUrl: e.target.value})} />
                <input type="date" value={movieForm.releaseDate || ''} onChange={e => setMovieForm({...movieForm, releaseDate: e.target.value})} />

                <select value={movieForm.movieFormat || '2D'} onChange={e => setMovieForm({...movieForm, movieFormat: e.target.value})}>
                    <option value="2D">{t('admin.adminDashboard.moviesTab.form.options.formats.2d')}</option>
                    <option value="3D">{t('admin.adminDashboard.moviesTab.form.options.formats.3d')}</option>
                    <option value="IMAX">{t('admin.adminDashboard.moviesTab.form.options.formats.imax')}</option>
                </select>
                
                <select value={movieForm.ageRating || 'P'} onChange={e => setMovieForm({...movieForm, ageRating: e.target.value})}>
                    <option value="P">{t('admin.adminDashboard.moviesTab.form.options.age.p')}</option>
                    <option value="T13">{t('admin.adminDashboard.moviesTab.form.options.age.t13')}</option>
                    <option value="T16">{t('admin.adminDashboard.moviesTab.form.options.age.t16')}</option>
                    <option value="T18">{t('admin.adminDashboard.moviesTab.form.options.age.t18')}</option>
                </select>
                
                {/* ✅ ĐÃ ĐẢO ĐÚNG LOGIC NHƯ YÊU CẦU + GIỮ ĐA NGÔN NGỮ */}
                <select value={String(movieForm.status !== undefined && movieForm.status !== null ? movieForm.status : "1")} 
                        onChange={e => setMovieForm({...movieForm, status: e.target.value})}>
                    <option value="1">{t('admin.adminDashboard.moviesTab.form.options.status.showing')}</option>
                    <option value="2">{t('admin.adminDashboard.moviesTab.form.options.status.upcoming')}</option>
                    <option value="0">{t('admin.adminDashboard.moviesTab.form.options.status.stopped')}</option>
                </select>

                <textarea className="full-width-field" placeholder={t('admin.adminDashboard.moviesTab.form.placeholders.description')} value={movieForm.description || ''} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
                
                <button type="submit" className="form-submit-btn-main">
                    {editingMovieId ? `💾 ${t('admin.adminDashboard.moviesTab.form.buttons.update')}` : `➕ ${t('admin.adminDashboard.moviesTab.form.buttons.create')}`}
                </button>
            </form>
            
            <div className="table-responsive-box">
                <table className="data-display-table">
                    <thead>
                        <tr>
                            <th>{t('admin.adminDashboard.moviesTab.table.movieId')}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.image')}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.title')}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.format')}</th>
                            <th>{t('admin.adminDashboard.moviesTab.table.age')}</th>
                            {/* Thêm cột trạng thái bị thiếu lúc merge */}
                            <th>Trạng Thái</th> 
                            <th>{t('admin.adminDashboard.moviesTab.table.actions')}</th>
                        </tr>
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
                                    {/* Cột hiển thị Badge trạng thái */}
                                    {String(m.status) === "1" && <span className="badge-status-green">{t('admin.adminDashboard.moviesTab.form.options.status.showing')}</span>}
                                    {String(m.status) === "2" && <span className="badge-status-yellow">{t('admin.adminDashboard.moviesTab.form.options.status.upcoming')}</span>}
                                    {String(m.status) === "0" && <span className="badge-status-red">{t('admin.adminDashboard.moviesTab.form.options.status.stopped')}</span>}
                                </td>
                                <td>
                                    <button onClick={() => triggerEditMovie(m)} className="control-btn btn-edit-sm">{t('admin.adminDashboard.moviesTab.table.editBtn')}</button>
                                    <button onClick={() => deleteMovieObj(m.movieId)} className="control-btn btn-delete-sm">{t('admin.adminDashboard.moviesTab.table.deleteBtn')}</button>
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