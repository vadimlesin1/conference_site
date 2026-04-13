import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import OrganizerDashboard from './OrganizerDashboard'; 
import AdminDashboard from './AdminDashboard'; 
import Navbar from '../components/Navbar'; 

const Dashboard = ({ setAuth }) => {
    const [name, setName] = useState("");
    const [roleId, setRoleId] = useState(null); 
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // --- СТИЛИ (Строгий дизайн) ---
    const containerStyle = { maxWidth: '1200px', margin: '30px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' };
    const headerStyle = { color: '#333', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '30px', fontSize: '24px', fontWeight: '600' };
    
    // Карточка участника
    const sectionContainerStyle = { background: '#fff', border: '1px solid #dee2e6', padding: '25px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
    const sectionHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom:'1px solid #e9ecef', paddingBottom:'15px' };
    const titleStyle = { margin: 0, fontSize: '18px', color: '#212529', fontWeight: '600' };
    
    // Кнопка
    const btnPrimary = { 
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0056b3', 
        color: 'white', 
        padding: '8px 16px', 
        textDecoration: 'none', 
        borderRadius: '4px', 
        fontSize: '14px', 
        fontWeight: '500',
        transition: 'background 0.2s'
    };

    // Таблица
    const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
    const thStyle = { background: '#f8f9fa', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' };
    const tdStyle = { padding: '16px 15px', borderBottom: '1px solid #e9ecef', color: '#212529', verticalAlign: 'top' };

    // Статусы
    const getStatusBadge = (status) => {
        const baseStyle = { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'inline-block' };
        
        if (status === 'accepted') {
            return <span style={{ ...baseStyle, background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc' }}>Принят</span>;
        }
        if (status === 'rejected') {
            return <span style={{ ...baseStyle, background: '#f8d7da', color: '#842029', border: '1px solid #f5c6cb' }}>Отклонен</span>;
        }
        return <span style={{ ...baseStyle, background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>На проверке</span>;
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color: '#666'}}>Загрузка данных...</div>;

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
            <Navbar />
            
            <div style={containerStyle}>
                
                {/* Заголовок страницы */}
                <h2 style={headerStyle}>
                    Личный кабинет: <span style={{fontWeight: '400', color: '#555'}}>{name}</span>
                </h2>
                
                {/* ЛОГИКА ОТОБРАЖЕНИЯ */}
                {roleId === 2 ? (
                    <OrganizerDashboard /> 
                ) : roleId === 1 ? (
                    <AdminDashboard />
                ) : (
                    // ИНТЕРФЕЙС УЧАСТНИКА
                    <div style={sectionContainerStyle}>
                        <div style={sectionHeaderStyle}>
                            <h3 style={titleStyle}>Мои заявки на доклады</h3>
                            <Link to="/create-submission" style={btnPrimary}>
                                <IconPlus /> Подать новую заявку
                            </Link>
                        </div>

                        {submissions.length === 0 ? (
                            <div style={{ padding: '40px', background: '#f8f9fa', color: '#6c757d', border: '2px dashed #dee2e6', borderRadius: '6px', textAlign: 'center' }}>
                                У вас пока нет активных заявок.
                            </div>
                        ) : (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Тема доклада</th>
                                        <th style={thStyle}>Секция / Место</th>
                                        <th style={thStyle}>Статус / Расписание</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td style={tdStyle} width="40%">
                                                <div style={{fontWeight: '700', fontSize: '16px', color: '#003366', marginBottom: '6px'}}>
                                                    {sub.title}
                                                </div>
                                                <div style={{fontSize: '13px', color: '#666', lineHeight: '1.5'}}>
                                                    {(sub.abstract || "").slice(0, 120)}...
                                                </div>
                                            </td>
                                            
                                            <td style={tdStyle}>
                                                <div style={{fontWeight: '600', color: '#333', marginBottom: '6px'}}>
                                                    {sub.section_name || "—"}
                                                </div>
                                                {/* АУДИТОРИЯ */}
                                                {sub.room && (
                                                    <div style={{display: 'flex', alignItems: 'center', fontSize: '13px', color: '#555'}}>
                                                        <IconMapPin />
                                                        <span>Аудитория {sub.room}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{marginBottom: sub.start_time ? '12px' : '0'}}>
                                                    {getStatusBadge(sub.status)}
                                                </div>
                                                
                                                {/* ВРЕМЯ */}
                                                {sub.status === 'accepted' && sub.start_time && (
                                                    <div style={{
                                                        fontSize:'13px', color:'#333', background: '#e7f5ff', 
                                                        borderLeft:'3px solid #0056b3', padding:'8px 12px', borderRadius: '0 4px 4px 0'
                                                    }}>
                                                        <div style={{fontWeight:'bold', color:'#0056b3', marginBottom: '2px'}}>
                                                            {new Date(sub.start_time).toLocaleDateString('ru-RU', {day:'numeric', month:'long', year: 'numeric'})}
                                                        </div>
                                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                                            <IconClock />
                                                            <span>{new Date(sub.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                            <span style={{marginLeft: '5px', color: '#666'}}>({sub.duration} мин)</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
