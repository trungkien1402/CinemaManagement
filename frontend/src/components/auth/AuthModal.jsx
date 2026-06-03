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
                    alert(t('authModal.alerts.loginSuccess') || "Đăng nhập thành công!");
                    onClose();

                    const userRole = user.role ? user.role.toUpperCase() : "";
                    if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
                        navigate('/admin');
                    } else {
                        window.location.reload();
                    }
                } else {
                    const errorMsg = resultAction.payload || t('authModal.alerts.loginFail');
                    alert((t('authModal.alerts.failPrefix') || "Lỗi: ") + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
                }
            } else {
                if (step === 1) {
                    const phoneRegex = /^(0)(3|5|7|8|9)([0-9]{8})$/;
                    if (!phoneRegex.test(formData.phone)) {
                        alert(t('authModal.alerts.invalidPhone') || "Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số!");
                        setLoading(false);
                        return;
                    }
                    await api.post('/auth/send-otp', { email: formData.email });
                    alert(t('authModal.alerts.otpSent') || "Đã gửi mã OTP!");
                    setStep(2);
                }
            }
        } catch (error) {
            const msg = error.response?.data || error.message;
            alert((t('authModal.alerts.errorPrefix') || "Lỗi hệ thống: ") + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
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
            alert(error.response?.data || t('authModal.alerts.otpInvalid'));
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
            alert(res.data?.message || res.data || t('authModal.alerts.forgotOtpSent'));
            setForgotStep(2);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || t('authModal.alerts.emailNotFound');
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            alert(t('authModal.alerts.mismatchPassword'));
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', {
                email: formData.email,
                otp: otpInput,
                newPassword: formData.password
            });
            alert(res.data?.message || res.data || t('authModal.alerts.resetPasswordSuccess'));
            setIsForgot(false);
            setIsLogin(true);
            setFormData({ ...formData, password: '' });
            setOtpInput('');
            setConfirmPassword('');
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || t('authModal.alerts.otpExpiredOrInvalid');
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
                            <h2 className="auth-title">{t('authModal.forgot.title1')}</h2>
                            <p style={{textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '10px'}}>
                                {t('authModal.forgot.desc1')}
                            </p>
                            <input
                                name="email"
                                type="email"
                                placeholder={t('authModal.form.placeholders.emailPlaceholder')}
                                onChange={handleChange}
                                value={formData.email || ''}
                                required
                            />
                            <button type="submit" className="auth-btn-submit" disabled={loading}>
                                {loading ? t('authModal.form.buttons.sending') : t('authModal.form.buttons.sendOtp')}
                            </button>
                            <button type="button" onClick={() => setIsForgot(false)} className="btn-back">
                                {t('authModal.form.buttons.backToLogin')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="auth-main-form">
                            <h2 className="auth-title">{t('authModal.forgot.title2')}</h2>
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
                                    placeholder={t('authModal.form.placeholders.otp6Digits')}
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
                                placeholder={t('authModal.form.placeholders.newPassword')}
                                onChange={handleChange}
                                value={formData.password || ''}
                                required
                            />
                            <input
                                type="password"
                                placeholder={t('authModal.form.placeholders.confirmNewPassword')}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                required
                            />
                            <button type="submit" className="auth-btn-submit" disabled={loading}>
                                {loading ? t('authModal.form.buttons.processing') : t('authModal.form.buttons.confirmReset')}
                            </button>
                            <button type="button" onClick={() => setForgotStep(1)} className="btn-back">
                                {t('authModal.form.buttons.cancelForgot')}
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
                                {t('authModal.tabs.login')}
                            </button>
                            <button
                                className={!isLogin ? 'active' : ''}
                                onClick={() => setIsLogin(false)}
                            >
                                {t('authModal.tabs.register')}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-main-form">
                            {isLogin ? (
                                <>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={t('authModal.form.placeholders.email')}
                                        onChange={handleChange}
                                        value={formData.email || ''}
                                        required
                                    />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder={t('authModal.form.placeholders.password')}
                                        onChange={handleChange}
                                        value={formData.password || ''}
                                        required
                                    />
                                    <span className="forgot-password-link" onClick={() => {
                                        setIsForgot(true);
                                        setForgotStep(1);
                                        setFormData({ ...formData, password: '' });
                                        setConfirmPassword('');
                                    }}>
                                        {t('authModal.form.buttons.forgotPassword')}
                                    </span>
                                    <button type="submit" className="auth-btn-submit" disabled={loading}>
                                        {loading ? t('authModal.form.buttons.processing') : t('authModal.form.buttons.login')}
                                    </button>
                                </>
                            ) : (
                                step === 1 ? (
                                    <>
                                        <input name="email" type="email" placeholder={t('authModal.form.placeholders.email')} onChange={handleChange} value={formData.email || ''} required />
                                        <input name="username" placeholder={t('authModal.form.placeholders.username')} onChange={handleChange} value={formData.username || ''} required />
                                        <input name="phone" type="tel" pattern="[0-9]*" maxLength="10" placeholder={t('authModal.form.placeholders.phone')} onChange={handleChange} value={formData.phone || ''} required />
                                        <select name="gender" onChange={handleChange} value={formData.gender || 'Nam'}>
                                            <option value="Nam">{t('authModal.form.options.gender.male')}</option>
                                            <option value="Nữ">{t('authModal.form.options.gender.female')}</option>
                                        </select>
                                        <input name="password" type="password" placeholder={t('authModal.form.placeholders.password')} onChange={handleChange} value={formData.password || ''} required />
                                        <button type="submit" className="auth-btn-submit" disabled={loading}>
                                            {loading ? t('authModal.form.buttons.sendingOtp') : t('authModal.form.buttons.continue')}
                                        </button>
                                    </>
                                ) : (
                                    <div className="otp-container">
                                        <input type="text" placeholder={t('authModal.form.placeholders.otp')} className="otp-input" value={otpInput || ''} onChange={(e) => setOtpInput(e.target.value)} maxLength="6" />
                                        <button type="button" onClick={handleVerifyOtp} className="auth-btn-submit">
                                            {t('authModal.form.buttons.confirm')}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="btn-back">
                                            {t('authModal.form.buttons.back')}
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