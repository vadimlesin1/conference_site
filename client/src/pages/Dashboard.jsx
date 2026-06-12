import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OrganizerDashboard from './OrganizerDashboard';
import ParticipantDashboard from './ParticipantDashboard';
import ReviewerDashboard from './ReviewerDashboard';
import ProgramCommitteeDashboard from './ProgramCommitteeDashboard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfileEditing from '../components/ProfileEditing';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = ({ setAuth }) => {
    const { t, language } = useLanguage();
    const [name, setName] = useState("");
    const [roleId, setRoleId] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [activeConference, setActiveConference] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(null);

    const getProfile = async () => {
        try {
            const response = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/dashboard/", {
                method: "GET",
                headers: { token: localStorage.token }
            });

            if (!response.ok) {
                console.error("Ошибка запроса:", response.status);
                setLoading(false);
                return;
            }

            const parseRes = await response.json();

            if (parseRes.user) {
                setName(parseRes.user.full_name);
                setRoleId(parseRes.user.role_id);
                // Дефолтная вкладка по роли
                if (parseRes.user.role_id === 2) setActiveTab('conferences');      // Админ ПК
                else if (parseRes.user.role_id === 5) setActiveTab('pc_submissions'); // ПК
                else if (parseRes.user.role_id === 4) setActiveTab('assigned');       // Рецензент
                else setActiveTab('my_submissions');                                  // Участник
            }

            if (parseRes.submissions) {
                setSubmissions(parseRes.submissions);
            }

            if (parseRes.activeConference) {
                setActiveConference(parseRes.activeConference);
            }

            setLoading(false);
        } catch (err) {
            console.error(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    // --- СТИЛИ САЙДБАРА ---
    const sidebarStyle = {
        width: '280px',
        background: '#fff',
        borderRight: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        flexShrink: 0
    };

    const profileBoxStyle = {
        padding: '30px 20px',
        borderBottom: '3px solid #003366',
        textAlign: 'center',
        background: '#f8f9fa'
    };

    const nameStyle = {
        fontSize: '20px',
        fontWeight: '700',
        color: '#003366',
        margin: '0 0 8px 0'
    };

    const roleStyle = {
        fontSize: '14px',
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const tabItemStyle = (isActive) => ({
        padding: '16px 25px',
        cursor: 'pointer',
        borderLeft: isActive ? '4px solid #003366' : '4px solid transparent',
        borderBottom: '1px solid #f1f3f5',
        background: isActive ? '#f0f4ff' : 'transparent',
        color: isActive ? '#003366' : '#444',
        fontWeight: isActive ? '700' : '500',
        fontSize: '15px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center'
    });

    const sectionLabel = (text) => (
        <>
            <div style={{ borderTop: '1px solid #e0e4e8', marginTop: '10px' }}></div>
            <div style={{ padding: '12px 25px 6px', fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>{text}</div>
        </>
    );

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>{t('common.loading')}</div>;

    // Определяем Роль строкой
    const roleNames = {
        2: language === 'ru' ? 'Администратор ПК' : 'PC Admin',
        3: language === 'ru' ? 'Участник' : 'Participant',
        4: language === 'ru' ? 'Рецензент' : 'Reviewer',
        5: language === 'ru' ? 'Программный комитет' : 'Program Committee'
    };
    const roleName = roleNames[roleId] || (language === 'ru' ? 'Участник' : 'Participant');

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />



            <div className="dashboard-layout" style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', background: '#fff', minHeight: 'calc(100vh - 64px)', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>

                {/* ЛЕВЫЙ САЙДБАР */}
                <div className="dashboard-sidebar" style={sidebarStyle}>
                    <div style={profileBoxStyle}>
                        <h2 style={nameStyle}>{name}</h2>
                        <div style={roleStyle}>{roleName}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ borderBottom: '1px solid #f1f3f5' }}>
                            <div style={tabItemStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>{t('dashboard.profile')}</div>
                        </div>

                        {/* ===== АДМИНИСТРАТОР ПК (role 2) ===== */}
                        {roleId === 2 && (
                            <>
                                {sectionLabel('Управление')}
                                <div style={tabItemStyle(activeTab === 'conferences')} onClick={() => setActiveTab('conferences')}>
                                    {language === 'ru' ? 'Конференции' : 'Conferences'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'sections')} onClick={() => setActiveTab('sections')}>{t('dashboard.sections')}</div>
                                <div style={tabItemStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>{t('dashboard.users')}</div>
                                <div style={tabItemStyle(activeTab === 'news')} onClick={() => setActiveTab('news')}>{t('dashboard.news')}</div>
                                <div style={tabItemStyle(activeTab === 'payment_confirm')} onClick={() => setActiveTab('payment_confirm')}>
                                    {language === 'ru' ? 'Подтверждение оплаты' : 'Payment Confirmation'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'publish')} onClick={() => setActiveTab('publish')}>
                                    {language === 'ru' ? 'Опубликовать сборник' : 'Publish Proceedings'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'statistics')} onClick={() => setActiveTab('statistics')}>{t('dashboard.statistics')}</div>

                                {sectionLabel('Рецензирование')}
                                <div style={tabItemStyle(activeTab === 'pc_submissions')} onClick={() => setActiveTab('pc_submissions')}>
                                    {language === 'ru' ? 'Доклады' : 'Submissions'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_reviews')} onClick={() => setActiveTab('pc_reviews')}>
                                    {language === 'ru' ? 'Рецензии' : 'Reviews'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_stats')} onClick={() => setActiveTab('pc_stats')}>
                                    {language === 'ru' ? 'Статистика рецензий' : 'Review Statistics'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_program')} onClick={() => setActiveTab('pc_program')}>
                                    {language === 'ru' ? 'Программа конференции' : 'Conference Program'}
                                </div>

                            </>
                        )}

                        {/* ===== ПРОГРАММНЫЙ КОМИТЕТ (role 5) ===== */}
                        {roleId === 5 && (
                            <>
                                {sectionLabel('Рецензирование')}
                                <div style={tabItemStyle(activeTab === 'pc_submissions')} onClick={() => setActiveTab('pc_submissions')}>
                                    {language === 'ru' ? 'Доклады' : 'Submissions'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_reviews')} onClick={() => setActiveTab('pc_reviews')}>
                                    {language === 'ru' ? 'Рецензии' : 'Reviews'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_stats')} onClick={() => setActiveTab('pc_stats')}>
                                    {language === 'ru' ? 'Статистика рецензий' : 'Review Statistics'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'pc_program')} onClick={() => setActiveTab('pc_program')}>
                                    {language === 'ru' ? 'Программа конференции' : 'Conference Program'}
                                </div>

                            </>
                        )}

                        {/* ===== РЕЦЕНЗЕНТ (role 4) ===== */}
                        {roleId === 4 && (
                            <>
                                <div style={tabItemStyle(activeTab === 'assigned')} onClick={() => setActiveTab('assigned')}>
                                    {language === 'ru' ? 'Мои рецензии' : 'My Reviews'}
                                </div>
                                <div style={tabItemStyle(activeTab === 'available')} onClick={() => setActiveTab('available')}>
                                    {language === 'ru' ? 'Доступные доклады' : 'Available Submissions'}
                                </div>
                            </>
                        )}

                        {/* ===== УЧАСТНИК (role 3) ===== */}
                        {roleId === 3 && (
                            <>
                                <div style={tabItemStyle(activeTab === 'my_submissions')} onClick={() => setActiveTab('my_submissions')}>{t('dashboard.mySubmissions')}</div>
                            </>
                        )}

                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ (КОНТЕНТ) */}
                <div style={{ flex: 1, padding: '40px', background: '#fcfcfd' }}>

                    {/* РЕНДЕР КОМПОНЕНТОВ В ЗАВИСИМОСТИ ОТ РОЛИ И ВКЛАДКИ */}
                    {activeTab === 'profile' ? (
                        <ProfileEditing />

                    ) : (activeTab && activeTab.startsWith('pc_')) || activeTab === 'applications' ? (
                        /* ПК-вкладки + Заявки/Расписание — и для role 2, и для role 5 */
                        <ProgramCommitteeDashboard activeTab={activeTab} activeConference={activeConference} roleId={roleId} />

                    ) : roleId === 2 ? (
                        /* Остальные вкладки Админа ПК */
                        <OrganizerDashboard activeTab={activeTab} activeConference={activeConference} />

                    ) : roleId === 4 ? (
                        <ReviewerDashboard activeTab={activeTab} activeConference={activeConference} />

                    ) : roleId === 5 ? (
                        <ProgramCommitteeDashboard activeTab={activeTab} activeConference={activeConference} roleId={roleId} />

                    ) : (
                        <ParticipantDashboard activeTab={activeTab} submissions={submissions} name={name} refreshData={getProfile} activeConference={activeConference} />
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
