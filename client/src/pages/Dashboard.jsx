import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import OrganizerDashboard from './OrganizerDashboard'; 
import AdminDashboard from './AdminDashboard'; 
import ParticipantDashboard from './ParticipantDashboard';
import Navbar from '../components/Navbar'; 
import ProfileEditing from '../components/ProfileEditing';

const Dashboard = ({ setAuth }) => {
    const [name, setName] = useState("");
    const [roleId, setRoleId] = useState(null); 
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState(null);

    const getProfile = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/dashboard/", {
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
                // Выставляем дефолтную вкладку
                if (parseRes.user.role_id === 2) setActiveTab('sections');
                else if (parseRes.user.role_id === 1) setActiveTab('applications');
                else setActiveTab('my_submissions');
            }
            
            if (parseRes.submissions) {
                setSubmissions(parseRes.submissions);
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

    // --- ИКОНКИ (Lucide Style) ---
    const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

    // --- СТИЛИ САЙДБАРА ---
    const sidebarStyle = {
        width: '280px',
        background: '#fff',
        borderRight: '1px solid #dee2e6',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)', // Navbar height
        flexShrink: 0
    };

    const profileBoxStyle = {
        padding: '30px 20px',
        borderBottom: '3px solid #003366', // Акцентное разделение из макета
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

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color: '#666'}}>Загрузка данных...</div>;

    // Определяем Роль строкой
    const roleName = roleId === 2 ? 'Организатор' : roleId === 1 ? 'Администратор' : 'Участник';

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
                            <div style={tabItemStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Редактировать профиль</div>
                        </div>

                        {/* ВКЛАДКИ ОРГАНИЗАТОРА */}
                        {roleId === 2 && (
                            <>
                                <div style={tabItemStyle(activeTab === 'sections')} onClick={() => setActiveTab('sections')}>Секции</div>
                                <div style={tabItemStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>Пользователи</div>
                                <div style={tabItemStyle(activeTab === 'schedule')} onClick={() => setActiveTab('schedule')}>Расписание</div>
                                <div style={tabItemStyle(activeTab === 'publish')} onClick={() => setActiveTab('publish')}>Публикация</div>
                                <div style={tabItemStyle(activeTab === 'news')} onClick={() => setActiveTab('news')}>Новости</div>
                                <div style={tabItemStyle(activeTab === 'statistics')} onClick={() => setActiveTab('statistics')}>Статистика</div>
                            </>
                        )}
                        
                        {/* ВКЛАДКИ АДМИНИСТРАТОРА */}
                        {roleId === 1 && (
                            <>
                                <div style={tabItemStyle(activeTab === 'applications')} onClick={() => setActiveTab('applications')}>Входящие заявки</div>
                                <div style={tabItemStyle(activeTab === 'schedule')} onClick={() => setActiveTab('schedule')}>Расписание секции</div>
                            </>
                        )}
                        
                        {/* ВКЛАДКИ УЧАСТНИКА */}
                        {roleId === 3 && (
                            <>
                                <div style={tabItemStyle(activeTab === 'my_submissions')} onClick={() => setActiveTab('my_submissions')}>Мои доклады</div>
                            </>
                        )}

                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ (КОНТЕНТ) */}
                <div style={{ flex: 1, padding: '40px', background: '#fcfcfd' }}>
                    
                    {/* РЕНДЕР КОМПОНЕНТОВ В ЗАВИСИМОСТИ ОТ РОЛИ И ВКЛАДКИ */}
                    {activeTab === 'profile' ? (
                        <ProfileEditing />
                    ) : roleId === 2 ? (
                        <OrganizerDashboard activeTab={activeTab} /> 
                    ) : roleId === 1 ? (
                        <AdminDashboard activeTab={activeTab} />
                    ) : (
                        <ParticipantDashboard activeTab={activeTab} submissions={submissions} name={name} refreshData={getProfile} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
