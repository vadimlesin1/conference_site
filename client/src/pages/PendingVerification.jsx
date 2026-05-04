import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PendingVerification = () => {
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
        maxWidth: '480px',
        padding: '50px 40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid #e1e4e8',
        textAlign: 'center'
    };

    const iconStyle = {
        fontSize: '48px',
        marginBottom: '20px'
    };

    const titleStyle = {
        margin: '0 0 15px 0',
        color: '#202124',
        fontSize: '26px',
        fontWeight: '700'
    };

    const textStyle = {
        margin: '0 0 25px 0',
        color: '#5f6368',
        fontSize: '16px',
        lineHeight: '1.6'
    };

    const btnStyle = {
        display: 'inline-block',
        width: '100%',
        padding: '14px',
        background: '#003366',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    };

    return (
        <div style={pageStyle}>
            <Navbar />
            
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}>✉️</div>
                    <h2 style={titleStyle}>Остался один шаг!</h2>
                    <p style={textStyle}>
                        Мы отправили письмо с ссылкой для подтверждения на вашу почту. 
                        Пожалуйста, проверьте почтовый ящик (и папку «Спам») и перейдите по ссылке, чтобы завершить регистрацию.
                    </p>
                    <Link to="/login" style={btnStyle}>Перейти ко входу</Link>
                </div>
            </div>
        </div>
    );
};

export default PendingVerification;
