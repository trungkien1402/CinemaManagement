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
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otpInput, setOtpInput] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        email: '',
        gender: 'Nam'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            // ================= LOGIN =================
            if (isLogin) {

                const resultAction = await dispatch(
                    login({
                        email: formData.email,
                        password: formData.password
                    })
                );

                console.log("RESULT ACTION:", resultAction);

                if (login.fulfilled.match(resultAction)) {

                    const user = resultAction.payload;

                    console.log(
                        "Dữ liệu User nhận được từ Backend:",
                        user
                    );
                    console.log("KEYS:", Object.keys(user));

                    console.log(
                        "Giá trị role là:",
                        user.role
                    );


                    alert(t('auth.authModal.alerts.loginSuccess'));

                    onClose();

                    const userRole = user.role
                        ? user.role.toUpperCase()
                        : "";

                    if (
                        userRole === "ROLE_ADMIN" ||
                        userRole === "ADMIN"
                    ) {

                        navigate('/admin');

                    } else {

                        window.location.reload();
                    }

                } else {

                    const errorMsg =
                        resultAction.payload ||
                        t('auth.authModal.alerts.loginFail');

                    alert(
                        t('auth.authModal.alerts.failPrefix') +
                        (
                            typeof errorMsg === 'object'
                                ? JSON.stringify(errorMsg)
                                : errorMsg
                        )
                    );
                }

            }

            // ================= REGISTER =================
            else {

                if (step === 1) {

                    await api.post('/auth/send-otp', {
                        email: formData.email
                    });

                    alert(t('auth.authModal.alerts.otpSent'));

                    setStep(2);
                }
            }

        } catch (error) {

            const msg =
                error.response?.data ||
                error.message;

            alert(
                t('auth.authModal.alerts.errorPrefix') +
                (
                    typeof msg === 'object'
                        ? JSON.stringify(msg)
                        : msg
                )
            );

        } finally {

            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {

        setLoading(true);

        try {

            const res = await api.post(
                '/auth/register-with-otp',
                {
                    ...formData,
                    otp: otpInput
                }
            );

            alert(res.data);

            setIsLogin(true);
            setStep(1);
            setOtpInput('');

        } catch (error) {

            alert(
                error.response?.data ||
                t('auth.authModal.alerts.otpInvalid')
            );

        } finally {

            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="auth-modal-overlay"
            onClick={onClose}
        >

            <div
                className="auth-modal-content"
                onClick={(e) => e.stopPropagation()}
            >

                <span
                    className="auth-close"
                    onClick={onClose}
                >
                    &times;
                </span>

                <div className="auth-tab-header">

                    <button
                        className={isLogin ? 'active' : ''}
                        onClick={() => {
                            setIsLogin(true);
                            setStep(1);
                        }}
                    >
                        {t('auth.authModal.tabs.login')}
                    </button>

                    <button
                        className={!isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(false)}
                    >
                        {t('auth.authModal.tabs.register')}
                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="auth-main-form"
                >

                    {isLogin ? (

                        <>
                            <input
                                name="email"
                                type="email"
                                placeholder={t('auth.authModal.form.placeholders.email')}
                                onChange={handleChange}
                                value={formData.email || ''}
                                required
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder={t('auth.authModal.form.placeholders.password')}
                                onChange={handleChange}
                                value={formData.password || ''}
                                required
                            />

                            <button
                                type="submit"
                                className="auth-btn-submit"
                                disabled={loading}
                            >
                                {
                                    loading
                                        ? t('auth.authModal.form.buttons.processing')
                                        : t('auth.authModal.form.buttons.login')
                                }
                            </button>
                        </>

                    ) : (

                        step === 1 ? (

                            <>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder={t('auth.authModal.form.placeholders.email')}
                                    onChange={handleChange}
                                    value={formData.email || ''}
                                    required
                                />

                                <input
                                    name="username"
                                    placeholder={t('auth.authModal.form.placeholders.username')}
                                    onChange={handleChange}
                                    value={formData.username || ''}
                                    required
                                />

                                <input
                                    name="phone"
                                    placeholder={t('auth.authModal.form.placeholders.phone')}
                                    onChange={handleChange}
                                    value={formData.phone || ''}
                                    required
                                />

                                <select
                                    name="gender"
                                    onChange={handleChange}
                                    value={formData.gender || 'Nam'}
                                >
                                    <option value="Nam">
                                        {t('auth.authModal.form.options.gender.male')}
                                    </option>

                                    <option value="Nữ">
                                        {t('auth.authModal.form.options.gender.female')}
                                    </option>
                                </select>

                                <input
                                    name="password"
                                    type="password"
                                    placeholder={t('auth.authModal.form.placeholders.password')}
                                    onChange={handleChange}
                                    value={formData.password || ''}
                                    required
                                />

                                <button
                                    type="submit"
                                    className="auth-btn-submit"
                                    disabled={loading}
                                >
                                    {
                                        loading
                                            ? t('auth.authModal.form.buttons.sendingOtp')
                                            : t('auth.authModal.form.buttons.continue')
                                    }
                                </button>
                            </>

                        ) : (

                            <div className="otp-container">

                                <input
                                    type="text"
                                    placeholder={t('auth.authModal.form.placeholders.otp')}
                                    className="otp-input"
                                    value={otpInput || ''}
                                    onChange={(e) =>
                                        setOtpInput(e.target.value)
                                    }
                                    maxLength="6"
                                />

                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="auth-btn-submit"
                                >
                                    {t('auth.authModal.form.buttons.confirm')}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-back"
                                >
                                    {t('auth.authModal.form.buttons.back')}
                                </button>

                            </div>
                        )
                    )}

                </form>
            </div>
        </div>
    );
};

export default AuthModal;