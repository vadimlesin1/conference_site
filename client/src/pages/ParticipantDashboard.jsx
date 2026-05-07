import React from 'react';
import { Link } from 'react-router-dom';

const ParticipantDashboard = ({ activeTab, submissions }) => {

    // --- ИКОНКИ (Lucide Style) ---
    const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

    // --- СТИЛИ ---
    const containerStyle = { fontFamily: 'Arial, sans-serif' };
    const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' };

    const btnPrimary = { 
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0056b3', color: 'white', padding: '8px 16px', 
        textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s'
    };

    const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
    const thStyle = { background: '#f1f3f5', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' };
    const tdStyle = { padding: '16px 15px', borderBottom: '1px solid #e9ecef', color: '#212529', verticalAlign: 'top' };

    const getStatusBadge = (status) => {
        const baseStyle = { padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'inline-block' };
        if (status === 'accepted') return <span style={{ ...baseStyle, background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc' }}>Принят</span>;
        if (status === 'published') return <span style={{ ...baseStyle, background: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' }}>Опубликован 🌟</span>;
        if (status === 'rejected') return <span style={{ ...baseStyle, background: '#f8d7da', color: '#842029', border: '1px solid #f5c6cb' }}>Отклонен</span>;
        return <span style={{ ...baseStyle, background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>На проверке</span>;
    };

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h3 style={{margin: 0, color: '#333', fontSize: '24px', fontWeight: '600'}}>Мои заявки на доклады</h3>
                <Link to="/create-submission" style={btnPrimary}>
                    <IconPlus /> Подать новую заявку
                </Link>
            </div>

            {activeTab === 'my_submissions' && (
                <>
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
                </>
            )}
        </div>
    );
};

export default ParticipantDashboard;
