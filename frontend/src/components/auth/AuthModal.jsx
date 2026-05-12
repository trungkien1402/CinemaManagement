import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import api from '../../api/api';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otpInput, setOtpInput] = useState('');
    const [formData, setFormData] = useState({
        username: '', password: '', phone: '', email: '', gender: 'Nam'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const resultAction = await dispatch(login({ email: formData.email, password: formData.password }));
                if (login.fulfilled.match(resultAction)) {
                    alert("Đăng nhập thành công!");
                    onClose();
                    window.location.reload();
                } else {
                    const errorMsg = resultAction.payload || "Email hoặc mật khẩu không đúng!";
                    alert("Thất bại: " + errorMsg);
                }
            } else {
                if (step === 1) {
                    await api.post('/auth/send-otp', { email: formData.email });
                    alert("Mã OTP đã được gửi vào Email của bạn!");
                    setStep(2);
                }
            }
        } catch (error) {
            // Sửa lỗi [object Object]
            const msg = error.response?.data || error.message;
            alert("Lỗi: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register-with-otp', { ...formData, otp: otpInput });
            alert(res.data);
            setIsLogin(true); setStep(1); setOtpInput('');
        } catch (error) {
            alert(error.response?.data || "Mã OTP không đúng!");
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <span className="auth-close" onClick={onClose}>&times;</span>
                <div className="auth-tab-header">
                    <button className={isLogin ? 'active' : ''} onClick={() => {setIsLogin(true); setStep(1);}}>ĐĂNG NHẬP</button>
                    <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>ĐĂNG KÝ</button>
                </div>
                <form onSubmit={handleSubmit} className="auth-main-form">
                    {isLogin ? (
                        <>
                            <input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email || ''} required />
                            <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} value={formData.password || ''} required />
                            <button type="submit" className="auth-btn-submit" disabled={loading}>{loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}</button>
                        </>
                    ) : (
                        step === 1 ? (
                            <>
                                <input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email || ''} required />
                                <input name="username" placeholder="Tên hiển thị" onChange={handleChange} value={formData.username || ''} required />
                                <input name="phone" placeholder="Số điện thoại" onChange={handleChange} value={formData.phone || ''} required />
                                <select name="gender" onChange={handleChange} value={formData.gender || 'Nam'}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select>
                                <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} value={formData.password || ''} required />
                                <button type="submit" className="auth-btn-submit" disabled={loading}>{loading ? "GỬI OTP..." : "TIẾP TỤC"}</button>
                            </>
                        ) : (
                            <div className="otp-container">
                                <input type="text" placeholder="Mã OTP" className="otp-input" value={otpInput || ''} onChange={(e) => setOtpInput(e.target.value)} maxLength="6" />
                                <button type="button" onClick={handleVerifyOtp} className="auth-btn-submit">XÁC NHẬN</button>
                                <button type="button" onClick={() => setStep(1)} className="btn-back">Quay lại</button>
                            </div>
                        )
                    )}
                </form>
            </div>
        </div>
    );
};
export default AuthModal;