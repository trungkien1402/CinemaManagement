import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import api from '../../api/api';
import '../style/AuthModal.css';
import { useTranslation } from 'react-i18next';

const AuthModal = ({ isOpen, onClose }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otpInput, setOtpInput] = useState('');

    // 🚀 THÊM STATE ĐỂ LƯU MẬT KHẨU NHẬP LẠI
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        email: '',
        gender: 'Nam'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: onlyNums });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    // ================= XỬ LÝ LOGIN / REGISTER =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const resultAction = await dispatch(
                    login({ email: formData.email, password: formData.password })
                );

                if (login.fulfilled.match(resultAction)) {
                    const user = resultAction.payload;
                    alert(t('auth.authModal.alerts.loginSuccess') || "Đăng nhập thành công!");
                    onClose();

                    const userRole = user.role ? user.role.toUpperCase() : "";
                    if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
                        navigate('/admin');
                    } else {
                        window.location.reload();
                    }
                } else {
                    const errorMsg = resultAction.payload || t('auth.authModal.alerts.loginFail');
                    alert((t('auth.authModal.alerts.failPrefix') || "Lỗi: ") + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
                }
            } else {
                if (step === 1) {
                    const phoneRegex = /^(0)(3|5|7|8|9)([0-9]{8})$/;
                    if (!phoneRegex.test(formData.phone)) {
                        alert(t('auth.authModal.alerts.invalidPhone') || "Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số!");
                        setLoading(false);
                        return;
                    }
                    await api.post('/auth/send-otp', { email: formData.email });
                    alert(t('auth.authModal.alerts.otpSent') || "Đã gửi mã OTP!");
                    setStep(2);
                }
            }
        } catch (error) {
            const msg = error.response?.data || error.message;
            alert((t('auth.authModal.alerts.errorPrefix') || "Lỗi hệ thống: ") + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register-with-otp', { ...formData, otp: otpInput });
            alert(res.data);
            setIsLogin(true);
            setStep(1);
            setOtpInput('');
        } catch (error) {
            alert(error.response?.data || t('auth.authModal.alerts.otpInvalid'));
        } finally {
            setLoading(false);
        }
    };

    // ================= XỬ LÝ QUÊN MẬT KHẨU =================
    const handleSendForgotOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email: formData.email });
            alert(res.data?.message || res.data || "Mã OTP khôi phục đã được gửi vào Email của bạn!");
            setForgotStep(2);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || "Email không tồn tại trong hệ thống!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // 🚀 KIỂM TRA 2 MẬT KHẨU CÓ KHỚP KHÔNG
        if (formData.password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', {
                email: formData.email,
                otp: otpInput,
                newPassword: formData.password
            });
            alert(res.data?.message || res.data || "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.");
            setIsForgot(false);
            setIsLogin(true);
            setFormData({ ...formData, password: '' });
            setOtpInput('');
            setConfirmPassword(''); // Reset lại trường confirm
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || "Mã OTP không đúng hoặc đã hết hạn!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="auth-close" onClick={onClose}>&times;</span>

                {isForgot ? (
                    forgotStep === 1 ? (
                        <form onSubmit={handleSendForgotOtp} className="auth-main-form">
                            <h2 className="auth-title">Khôi Phục Mật Khẩu</h2>
                            <p style={{textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                                Nhập Email đã đăng ký để nhận mã OTP
                            </p>
                            <input
                                name="email"
                                type="email"
                                placeholder="Nhập email của bạn"
                                onChange={handleChange}
                                value={formData.email || ''}
                                required
                            />
                            <button type="submit" className="auth-btn-submit" disabled={loading}>
                                {loading ? "Đang gửi..." : "Gửi Mã OTP"}
                            </button>
                            <button type="button" onClick={() => setIsForgot(false)} className="btn-back">
                                Quay lại Đăng Nhập
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="auth-main-form">
                            <h2 className="auth-title">Đặt Lại Mật Khẩu</h2>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                disabled
                                style={{ backgroundColor: '#f0f0f0', color: '#888' }}
                            />
                            <div className="otp-container">
                                <input
                                    type="text"
                                    placeholder="Nhập mã OTP (6 số)"
                                    className="otp-input"
                                    value={otpInput || ''}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    maxLength="6"
                                    required
                                />
                            </div>
                            <input
                                name="password"
                                type="password"
                                placeholder="Nhập mật khẩu mới" /* Đã sửa chữ MỚI */
                                onChange={handleChange}
                                value={formData.password || ''}
                                required
                            />

                            {/* 🚀 THÊM Ô NHẬP LẠI MẬT KHẨU */}
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                required
                            />

                            <button type="submit" className="auth-btn-submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Xác Nhận Đổi Mật Khẩu"}
                            </button>
                            <button type="button" onClick={() => setForgotStep(1)} className="btn-back">
                                Hủy / Nhập lại Email
                            </button>
                        </form>
                    )
                ) : (
                    <>
                        <div className="auth-tab-header">
                            <button
                                className={isLogin ? 'active' : ''}
                                onClick={() => { setIsLogin(true); setStep(1); }}
                            >
                                {t('auth.authModal.tabs.login') || "Đăng Nhập"}
                            </button>
                            <button
                                className={!isLogin ? 'active' : ''}
                                onClick={() => setIsLogin(false)}
                            >
                                {t('auth.authModal.tabs.register') || "Đăng Ký"}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-main-form">
                            {isLogin ? (
                                <>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={t('auth.authModal.form.placeholders.email') || "Email"}
                                        onChange={handleChange}
                                        value={formData.email || ''}
                                        required
                                    />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder={t('auth.authModal.form.placeholders.password') || "Mật khẩu"}
                                        onChange={handleChange}
                                        value={formData.password || ''}
                                        required
                                    />

                                    <span className="forgot-password-link" onClick={() => {
                                        setIsForgot(true);
                                        setForgotStep(1);
                                        setFormData({ ...formData, password: '' });
                                        setConfirmPassword(''); // Reset khi bấm vào quên MK
                                    }}>
                                        Quên mật khẩu?
                                    </span>

                                    <button type="submit" className="auth-btn-submit" disabled={loading}>
                                        {loading ? (t('auth.authModal.form.buttons.processing') || "Đang xử lý...") : (t('auth.authModal.form.buttons.login') || "Đăng Nhập")}
                                    </button>
                                </>
                            ) : (
                                step === 1 ? (
                                    <>
                                        <input name="email" type="email" placeholder={t('auth.authModal.form.placeholders.email') || "Email"} onChange={handleChange} value={formData.email || ''} required />
                                        <input name="username" placeholder={t('auth.authModal.form.placeholders.username') || "Tên hiển thị"} onChange={handleChange} value={formData.username || ''} required />
                                        <input name="phone" type="tel" pattern="[0-9]*" maxLength="10" placeholder={t('auth.authModal.form.placeholders.phone') || "Số điện thoại"} onChange={handleChange} value={formData.phone || ''} required />
                                        <select name="gender" onChange={handleChange} value={formData.gender || 'Nam'}>
                                            <option value="Nam">{t('auth.authModal.form.options.gender.male') || "Nam"}</option>
                                            <option value="Nữ">{t('auth.authModal.form.options.gender.female') || "Nữ"}</option>
                                        </select>
                                        <input name="password" type="password" placeholder={t('auth.authModal.form.placeholders.password') || "Mật khẩu"} onChange={handleChange} value={formData.password || ''} required />

                                        <button type="submit" className="auth-btn-submit" disabled={loading}>
                                            {loading ? (t('auth.authModal.form.buttons.sendingOtp') || "Đang gửi...") : (t('auth.authModal.form.buttons.continue') || "Tiếp Tục")}
                                        </button>
                                    </>
                                ) : (
                                    <div className="otp-container">
                                        <input type="text" placeholder={t('auth.authModal.form.placeholders.otp') || "Mã OTP"} className="otp-input" value={otpInput || ''} onChange={(e) => setOtpInput(e.target.value)} maxLength="6" />
                                        <button type="button" onClick={handleVerifyOtp} className="auth-btn-submit">
                                            {t('auth.authModal.form.buttons.confirm') || "Xác Nhận"}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="btn-back">
                                            {t('auth.authModal.form.buttons.back') || "Quay lại"}
                                        </button>
                                    </div>
                                )
                            )}
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;