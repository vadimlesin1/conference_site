import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; 

const Archive = () => {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/archive")
            .then(res => res.json())
            .then(data => {
                setArchives(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // --- ИКОНКИ (Lucide Style) ---
    const IconArchive = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:10}}><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
    const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:6}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

    // Helpers
    const getYear = (dateStr) => new Date(dateStr).getFullYear();
    const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {day:'numeric', month:'long'});

    // --- СТИЛИ ---
    const pageStyle = { background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' };
    const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', flex: 1, width: '100%' };
    
    const headerStyle = { 
        display: 'flex', alignItems: 'center', 
        borderBottom: '2px solid #003366', paddingBottom: '20px', marginBottom: '30px',
        color: '#333', fontSize: '28px', fontWeight: '600'
    };

    const gridStyle = { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '25px' 
    };

    const cardStyle = { 
        background: '#fff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '6px', 
        padding: '25px',
        textDecoration: 'none', 
        color: 'inherit', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        position: 'relative',
        overflow: 'hidden'
    };

    const yearBadgeStyle = { 
        display: 'inline-block', 
        background: '#003366', 
        color: 'white', 
        padding: '4px 10px', 
        borderRadius: '4px', 
        fontWeight: '600', 
        fontSize: '12px', 
        marginBottom: '15px', 
        width: 'fit-content'
    };

    const cardTitleStyle = { margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: '#212529', lineHeight: '1.3' };
    
    const metaRowStyle = { 
        fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', marginBottom: '8px' 
    };

    const descStyle = { 
        fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '15px 0 20px', flex: 1 
    };

    const footerLinkStyle = { 
        marginTop: 'auto', 
        color: '#0056b3', 
        fontWeight: '600', 
        fontSize: '14px', 
        display: 'flex', 
        alignItems: 'center',
        paddingTop: '15px',
        borderTop: '1px solid #f1f3f5'
    };

    const emptyStateStyle = {
        padding: '60px', background: '#fff', textAlign: 'center', 
        color: '#6c757d', border: '1px solid #dee2e6', borderRadius: '6px'
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color: '#666'}}>Загрузка архива...</div>;

    return (
        <div style={pageStyle}>
            <Navbar />
            
            <div style={containerStyle}>
                <h1 style={headerStyle}>
                    <IconArchive /> Архив мероприятий
                </h1>

                {archives.length === 0 ? (
                    <div style={emptyStateStyle}>Нет архивных конференций.</div>
                ) : (
                    <div style={gridStyle}>
                        {archives.map(arch => (
                            <Link 
                                to={`/archive/${arch.id}`} 
                                key={arch.id} 
                                style={cardStyle}
                                // Простой эффект при наведении через inline-стили не идеален, 
                                // но для строгого дизайна достаточно изменения цвета рамки/тени
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = '#b6d4fe';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,51,102,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.03)';
                                }}
                            >
                                <div style={yearBadgeStyle}>{getYear(arch.date_start)}</div>
                                
                                <h3 style={cardTitleStyle}>{arch.title}</h3>
                                
                                <div style={metaRowStyle}>
                                    <IconCalendar /> 
                                    <span>{formatDate(arch.date_start)} — {formatDate(arch.date_end)}</span>
                                </div>
                                {arch.location && (
                                    <div style={metaRowStyle}>
                                        <IconMapPin /> 
                                        <span>{arch.location}</span>
                                    </div>
                                )}

                                <p style={descStyle}>
                                    {arch.description ? arch.description.slice(0, 120) + (arch.description.length > 120 ? '...' : '') : 'Описание отсутствует'}
                                </p>

                                <div style={footerLinkStyle}>
                                    Материалы конференции <IconArrowRight />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default Archive;
