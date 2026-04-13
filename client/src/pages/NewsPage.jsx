import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/public/news");
                if (res.ok) setNews(await res.json());
            } catch (err) {
                console.error("Ошибка загрузки новостей:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Форматирование даты
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // --- ИКОНКИ (Lucide Style) ---
    const IconNewspaper = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:10}}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>;
    const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

    // --- СТИЛИ ---
    const pageContainerStyle = { background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' };
    const contentWrapperStyle = { flex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 20px', width: '100%' };
    
    const headerStyle = { 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#333', marginBottom: '50px', fontSize: '32px', fontWeight: '700',
        paddingBottom: '20px', borderBottom: '2px solid #003366'
    };

    const newsCardStyle = { 
        background: 'white', 
        borderRadius: '6px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        border: '1px solid #dee2e6',
        padding: '35px',
        position: 'relative',
        overflow: 'hidden'
    };

    const dateBadgeStyle = { 
        display: 'inline-flex', alignItems: 'center',
        fontSize: '13px', fontWeight: '600', color: '#666', 
        marginBottom: '15px', 
        background: '#f1f3f5', padding: '6px 12px', borderRadius: '4px'
    };

    const titleStyle = { 
        margin: '0 0 20px 0', 
        fontSize: '24px', 
        color: '#003366',
        fontWeight: '700',
        wordWrap: 'break-word', 
        lineHeight: '1.3'
    };

    const contentStyle = { 
        color: '#333', 
        fontSize: '16px', 
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',       
        wordWrap: 'break-word'
    };

    const emptyStateStyle = {
        textAlign: 'center', padding: '60px', background: '#fff', 
        border: '1px solid #dee2e6', borderRadius: '6px', color: '#6c757d'
    };

    return (
        <div style={pageContainerStyle}>
            <Navbar />
            
            <div style={contentWrapperStyle}>
                <h1 style={headerStyle}>
                    <IconNewspaper /> Новости конференции
                </h1>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Загрузка ленты новостей...</div>
                ) : news.length === 0 ? (
                    <div style={emptyStateStyle}>
                        Новостей пока нет. Следите за обновлениями.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {news.map(item => (
                            <div key={item.id} style={newsCardStyle}>
                                <div style={dateBadgeStyle}>
                                    <IconCalendar /> {formatDate(item.created_at)}
                                </div>
                                
                                <h2 style={titleStyle}>
                                    {item.title}
                                </h2>

                                <div style={contentStyle}>
                                    {item.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default NewsPage;
