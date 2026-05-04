import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginUser } from '../api/auth';

const Login = () => {
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { email, password } = inputs;

    const onChange = (e) => {
        if (error) setError('');
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await loginUser(email, password);
            const parseRes = await response.json();

            if (response.ok) {
                localStorage.setItem("token", parseRes.token);
                window.location.href = "/dashboard";
            } else {
                if (parseRes === "Подтвердите email перед входом") {
                    window.location.href = "/pending-verification";
                } else {
                    setError(parseRes || 'Не удалось войти в систему');
                }
            }
        } catch (err) {
            setError('Ошибка сети. Проверьте подключение.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- СТИЛИ ---
    const pageStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f6f8 0%, #e8f0fe 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
    };

    const containerStyle = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    };

    const cardStyle = {
        background: '#ffffff',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        border: error ? '1px solid #f5c6cb' : '1px solid #e1e4e8'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '30px'
    };

    const titleStyle = {
        margin: '0 0 8px 0',
        color: '#202124',
        fontSize: '28px',
        fontWeight: '700'
    };

    const subtitleStyle = {
        margin: 0,
        color: '#5f6368',
        fontSize: '15px'
    };

    // [ОБНОВЛЕНО] Уведомление без иконки — чище и строже
    const errorStyle = {
        background: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '6px',
        padding: '14px 18px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: '500',
        opacity: error ? 1 : 0,
        transform: error ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.15)',
        textAlign: 'center'
    };

    const formGroupStyle = {
        marginBottom: '20px',
        position: 'relative'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#202124'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        fontSize: '14px',
        border: error ? '1px solid #dc3545' : '1px solid #dfe1e5',
        borderRadius: '6px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: '#fafbfc'
    };

    const inputFocusStyle = {
        borderColor: '#003366 !important',
        boxShadow: '0 0 0 3px rgba(0, 51, 102, 0.1)'
    };

    const btnStyle = {
        width: '100%',
        padding: '14px',
        background: isLoading ? '#6c757d' : '#003366',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '10px'
    };

    const footerStyle = {
        textAlign: 'center',
        marginTop: '25px',
        fontSize: '14px',
        color: '#5f6368'
    };

    const linkStyle = {
        color: '#003366',
        textDecoration: 'none',
        fontWeight: '600'
    };

    return (
        <div style={pageStyle}>
            <Navbar />
            
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h2 style={titleStyle}>Вход в систему</h2>
                        <p style={subtitleStyle}>Используйте аккаунт участника конференции</p>
                    </div>

                    {/* Уведомление об ошибке (БЕЗ ИКОНКИ) */}
                    {error && (
                        <div style={errorStyle}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmitForm}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Электронная почта</label>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={onChange} 
                                required 
                                disabled={isLoading}
                                style={inputStyle}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    if (!error) e.target.style.borderColor = '#dfe1e5';
                                }}
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Пароль</label>
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={onChange} 
                                required 
                                disabled={isLoading}
                                style={inputStyle}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    if (!error) e.target.style.borderColor = '#dfe1e5';
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={btnStyle}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <div style={footerStyle}>
                        Нет аккаунта? 
                        <Link to="/register" style={linkStyle}> Зарегистрироваться</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
