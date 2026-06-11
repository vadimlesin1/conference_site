import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const { t, language } = useLanguage();
    const [sections, setSections] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Секции
                const secRes = await fetch("http://localhost:5000/api/public/sections");
                if (secRes.ok) setSections(await secRes.json());

                // 2. Статистика
                const statRes = await fetch("http://localhost:5000/api/public/stats");
                if (statRes.ok) setStatsData(await statRes.json());

                // 3. Новости
                const newsRes = await fetch("http://localhost:5000/api/public/news");
                if (newsRes.ok) setNews(await newsRes.json());

            } catch (err) {
                console.error("Ошибка сети:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- SVG ИКОНКИ ---
    const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, minWidth: 14 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 6 }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
    const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, minWidth: 14 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    const IconPin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 10 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const IconDoor = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, minWidth: 14 }}><path d="M3 21h18M5 21V7l8-4 8 4v14M13 3v18M5 12h8"></path></svg>;

    // Форматирование даты
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // --- СТИЛИ ---
    const styles = {
        hero: {
            background: 'linear-gradient(135deg, #003366 0%, #0056b3 100%)',
            color: 'white', padding: '80px 20px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        heroBtn: {
            background: '#ffffff', color: '#003366', padding: '12px 30px', fontSize: '16px',
            textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '20px',
            transition: 'all 0.3s'
        },
        infoPanel: {
            maxWidth: '1000px', margin: '-40px auto 40px', background: 'white',
            borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex', justifyContent: 'space-around', padding: '30px', flexWrap: 'wrap', gap: '20px'
        },
        infoItem: { display: 'flex', alignItems: 'center', fontSize: '16px', color: '#333', fontWeight: '500' },
        statBox: { textAlign: 'center', minWidth: '150px' },
        statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#003366', display: 'block' },
        statLabel: { fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' },

        gridContainer: { padding: '20px 20px 60px', maxWidth: '1200px', margin: '0 auto' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
        card: (id) => ({
            background: '#fff', border: '1px solid #e0e0e0', borderTop: '4px solid #0056b3',
            borderRadius: '6px', padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
            transform: hoveredCard === id ? 'translateY(-5px)' : 'none',
            boxShadow: hoveredCard === id ? '0 10px 20px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
            cursor: 'default'
        }),
        cardBody: { padding: '25px' },
        cardFooter: { background: '#f8f9fa', padding: '15px 25px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' },
        sectionTitle: { margin: '0 0 15px 0', color: '#212529', fontSize: '20px', fontWeight: '600' },
        metaInfo: { display: 'flex', alignItems: 'center', color: '#555', fontSize: '14px', marginBottom: '8px' },
        linkBtn: { textDecoration: 'none', color: '#0056b3', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '4px' }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            {/* БАННЕР */}
            <div style={styles.hero}>
                {loading ? (
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 15px 0' }}>{t('common.loading')}</h1>
                ) : statsData && statsData.info ? (
                    <>
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 15px 0', fontWeight: '700' }}>
                            {statsData.info.title}
                        </h1>
                        <p style={{ fontSize: '1.1rem', margin: '0 0 25px 0', opacity: 0.9, maxWidth: '700px' }}>
                            {statsData.info.description || "Актуальные проблемы управления и информационных технологий"}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 15px 0', fontWeight: '700' }}>
                            {t('home.title')}
                        </h1>
                        <p style={{ fontSize: '1.1rem', margin: '0 0 25px 0', opacity: 0.9 }}>
                            {t('home.noActiveConference')}
                        </p>
                    </>
                )}

                <Link to="/register" style={styles.heroBtn}>
                    {t('home.participate')}
                </Link>
            </div>

            {/* ИНФО-ПАНЕЛЬ */}
            {statsData && statsData.info && (
                <div style={styles.infoPanel}>
                    <div style={{ flex: 1.5, minWidth: '400px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#003366', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {language === 'ru' ? 'Контрольные даты' : 'Key Dates'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#f0f7ff', borderRadius: '6px', borderLeft: '3px solid #0056b3' }}>
                                <IconCalendar />
                                <div>
                                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>{language === 'ru' ? 'Начало подачи заявок' : 'Submission Start'}</div>
                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>{formatDate(statsData.info.date_start)}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#fff8e1', borderRadius: '6px', borderLeft: '3px solid #ef6c00' }}>
                                <IconCalendar />
                                <div>
                                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>{language === 'ru' ? 'Окончание заявок' : 'Submission Deadline'}</div>
                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>{statsData.info.submission_deadline ? formatDate(statsData.info.submission_deadline) : '—'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#e8f5e9', borderRadius: '6px', borderLeft: '3px solid #2e7d32' }}>
                                <IconCalendar />
                                <div>
                                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>{language === 'ru' ? 'Программа конференции' : 'Conference Program'}</div>
                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>{statsData.info.program_formation_date ? formatDate(statsData.info.program_formation_date) : '—'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#fce4ec', borderRadius: '6px', borderLeft: '3px solid #c62828' }}>
                                <IconCalendar />
                                <div>
                                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: '600' }}>{language === 'ru' ? 'Публикация сборников' : 'Publication'}</div>
                                    <div style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>{formatDate(statsData.info.date_end)}</div>
                                </div>
                            </div>
                        </div>
                        {statsData.info.location && (
                            <div style={{ ...styles.infoItem, marginTop: '14px' }}>
                                <IconPin /> {statsData.info.location}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 0.7, display: 'flex', justifyContent: 'space-around', alignItems: 'center', minWidth: '200px', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{statsData.stats ? statsData.stats.submissions : 0}</span>
                            <span style={styles.statLabel}>{language === 'ru' ? 'Докладов' : 'Papers'}</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{statsData.stats ? statsData.stats.participants : 0}</span>
                            <span style={styles.statLabel}>{language === 'ru' ? 'Участников' : 'Participants'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* СЕКЦИИ */}
            <div style={styles.gridContainer}>
                <h2 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '30px' }}>
                    {t('home.sections')}
                </h2>

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>{t('common.loading')}</p>
                ) : sections.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', color: '#666', border: '1px solid #e0e0e0' }}>
                        {t('home.noSections')}
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {sections.map((sec) => (
                            <div
                                key={sec.id}
                                style={styles.card(sec.id)}
                                onMouseEnter={() => setHoveredCard(sec.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div style={styles.cardBody}>
                                    <h3 style={styles.sectionTitle}>{sec.title}</h3>

                                    <div style={{ marginTop: '20px' }}>
                                        {/* 1. Руководитель */}
                                        <div style={styles.metaInfo}>
                                            <IconUser />
                                            {sec.managers_text ? sec.managers_text : (language === 'ru' ? 'Руководитель не назначен' : 'Manager not assigned')}
                                        </div>

                                        {/* 2. Аудитория (если есть) */}
                                        <div style={styles.metaInfo}>
                                            <IconDoor />
                                            {sec.room ? (language === 'ru' ? `Аудитория ${sec.room}` : `Room ${sec.room}`) : (language === 'ru' ? 'Аудитория уточняется' : 'Room TBD')}
                                        </div>

                                        {/* 3. Дата (если есть) */}
                                        <div style={styles.metaInfo}>
                                            <IconCalendar />
                                            {sec.section_date ? formatDate(sec.section_date) : (language === 'ru' ? 'Дата не назначена' : 'Date TBD')}
                                        </div>
                                    </div>
                                </div>
                                <div style={styles.cardFooter}>
                                    <Link
                                        to={`/schedule?section=${sec.title}`}
                                        style={styles.linkBtn}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {language === 'ru' ? 'Открыть расписание' : 'View Schedule'} <IconArrow />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* БЛОК НОВОСТЕЙ */}
            {news.length > 0 && (
                <div style={{ maxWidth: '1000px', margin: '40px auto 80px', padding: '0 20px' }}>
                    <h2 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '30px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                        {language === 'ru' ? 'Последние новости' : 'Latest News'}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {news.slice(0, 3).map(item => (
                            <div key={item.id} style={{
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                border: '1px solid #eee',
                                borderTop: '4px solid #0056b3',
                                padding: '25px'
                            }}>
                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                                    {formatDate(item.created_at)}
                                </div>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#003366', lineHeight: '1.4' }}>
                                    {item.title}
                                </h3>
                                <div style={{
                                    margin: 0,
                                    color: '#444',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}>
                                    {item.content.length > 300
                                        ? item.content.slice(0, 300) + '...'
                                        : item.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {news.length > 3 && (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <Link to="/news" style={{
                                display: 'inline-block',
                                padding: '10px 25px',
                                border: '2px solid #0056b3',
                                borderRadius: '30px',
                                color: '#0056b3',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                                onMouseEnter={e => { e.target.style.background = '#0056b3'; e.target.style.color = 'white'; }}
                                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#0056b3'; }}
                            >
                                {language === 'ru' ? 'Читать все новости →' : 'Read all news →'}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Home;
