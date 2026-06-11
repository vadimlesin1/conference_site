import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

const Proceedings = () => {
    const { language, t } = useLanguage();
    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/public/stats");
                if (res.ok) {
                    const data = await res.json();
                    if (data.info) {
                        setConference(data.info);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const pageStyle = { minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Arial, sans-serif' };
    const containerStyle = { maxWidth: '900px', margin: '40px auto', padding: '0 20px' };
    const cardStyle = { background: '#fff', borderRadius: '4px', padding: '40px', border: '1px solid #dce0e4', textAlign: 'left' };

    if (loading) {
        return (
            <div style={pageStyle}>
                <Navbar />
                <div style={containerStyle}>
                    <div style={cardStyle}>Загрузка...</div>
                </div>
            </div>
        );
    }

    if (!conference) {
        return (
            <div style={pageStyle}>
                <Navbar />
                <div style={containerStyle}>
                    <div style={cardStyle}>
                        <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>{language === 'ru' ? 'Нет активной конференции' : 'No active conference'}</h2>
                    </div>
                </div>
            </div>
        );
    }

    const today = new Date();
    const endDate = new Date(conference.date_end);
    const isPublished = today >= endDate && conference.proceedings_url;

    const btnStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '10px 20px',
        background: '#003366',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '3px',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'background 0.2s',
        border: '1px solid #002244'
    };

    return (
        <div style={pageStyle}>
            <Navbar />
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h1 style={{ color: '#003366', margin: '0 0 10px 0', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {language === 'ru' ? 'Сборник трудов конференции' : 'Conference Proceedings'}
                    </h1>
                    <h3 style={{ color: '#495057', margin: '0 0 20px 0', fontWeight: 'normal', fontSize: '18px' }}>
                        {conference.title}
                    </h3>
                    
                    <hr style={{ border: 'none', borderTop: '2px solid #003366', margin: '0 0 30px 0' }} />

                    {isPublished ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fa', padding: '20px', border: '1px solid #dee2e6', borderRadius: '3px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#212529', fontSize: '16px' }}>{language === 'ru' ? 'Статус: Опубликован' : 'Status: Published'}</h4>
                                <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                                    {language === 'ru' ? 'Электронная версия сборника доступна для загрузки в формате PDF.' : 'The electronic version of the proceedings is available for download in PDF format.'}
                                </p>
                            </div>
                            <a href={`http://localhost:5000${conference.proceedings_url}`} target="_blank" rel="noopener noreferrer" style={btnStyle} onMouseEnter={(e) => e.target.style.background = '#002244'} onMouseLeave={(e) => e.target.style.background = '#003366'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                    <polyline points="9 15 12 18 15 15"></polyline>
                                </svg>
                                {language === 'ru' ? 'Скачать сборник' : 'Download Proceedings'}
                            </a>
                        </div>
                    ) : (
                        <div style={{ background: '#f8f9fa', borderLeft: '4px solid #003366', padding: '20px', color: '#333' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#003366', fontSize: '16px', textTransform: 'uppercase' }}>
                                {language === 'ru' ? 'Информация о публикации' : 'Publication Information'}
                            </h4>
                            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px 0', width: '200px', color: '#6c757d' }}>{language === 'ru' ? 'Текущий статус:' : 'Current Status:'}</td>
                                        <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{language === 'ru' ? 'Ожидается публикация' : 'Pending Publication'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#6c757d' }}>{language === 'ru' ? 'Запланированная дата:' : 'Scheduled Date:'}</td>
                                        <td style={{ padding: '8px 0', fontWeight: 'bold' }}>
                                            {endDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Proceedings;
