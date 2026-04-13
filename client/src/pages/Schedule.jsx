import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Schedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState("all");

    const location = useLocation();

    useEffect(() => {
        fetchSchedule();
    }, []);

    // Следим за URL: Если есть ?section=..., ставим фильтр
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sectionParam = params.get('section'); 
        if (sectionParam) {
            setSelectedSection(sectionParam);
        }
    }, [location]);

    const fetchSchedule = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/public/schedule");
            const data = await response.json();
            setSchedule(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const formatTimeRange = (startTime, duration) => {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60000); 
        const options = { hour: '2-digit', minute: '2-digit' };
        return `${start.toLocaleTimeString([], options)} – ${end.toLocaleTimeString([], options)}`;
    };

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', weekday: 'long' };
        const dateStr = new Date(dateString).toLocaleDateString('ru-RU', options);
        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    };

    // --- ЛОГИКА ФИЛЬТРАЦИИ ---
    const uniqueSections = ["all", ...new Set(schedule.map(item => item.section_name))];

    const filteredSchedule = selectedSection === "all" 
        ? schedule 
        : schedule.filter(item => item.section_name === selectedSection);

    // --- ИКОНКИ (Lucide Style) ---
    const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
    const IconMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

    // --- СТРОГИЕ СТИЛИ ---
    const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' };
    
    // Заголовок с фильтром в одну линию
    const headerBlockStyle = { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid #003366', 
        paddingBottom: '20px', 
        marginBottom: '30px' 
    };

    const pageTitleStyle = { 
        margin: 0, 
        color: '#333', 
        fontSize: '28px', 
        fontWeight: '600',
        display: 'flex', 
        alignItems: 'center' 
    };

    const filterBoxStyle = {
        display: 'flex', 
        alignItems: 'center', 
        background: '#f8f9fa', 
        padding: '8px 12px', 
        borderRadius: '4px', 
        border: '1px solid #e9ecef'
    };

    const selectStyle = {
        padding: '6px 10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        fontSize: '14px',
        minWidth: '220px',
        cursor: 'pointer',
        background: '#fff',
        fontWeight: '500',
        color: '#333',
        outline: 'none'
    };

    // Карточка доклада
    const cardStyle = { 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        borderRadius: '6px', 
        padding: '0', // Padding removed from container to control inner layout
        marginBottom: '16px', 
        display: 'flex',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        overflow: 'hidden'
    };

    const timeBlockStyle = { 
        width: '120px',
        background: '#f8f9fa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center'
    };

    const timeStyle = { fontSize: '18px', fontWeight: '700', color: '#003366' };
    const durationStyle = { fontSize: '12px', color: '#666', marginTop: '4px' };

    const contentBlockStyle = { flex: 1, padding: '20px 25px' };

    const metaRowStyle = { display: 'flex', gap: '15px', marginBottom: '10px', alignItems: 'center' };

    const sectionBadgeStyle = { 
        background: '#e7f5ff', color: '#0056b3', fontSize: '11px', fontWeight: '700', 
        padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' 
    };

    const roomBadgeStyle = { 
        display: 'flex', alignItems: 'center', color: '#555', fontSize: '13px', fontWeight: '500' 
    };

    const titleStyle = { margin: '0 0 8px 0', color: '#222', fontSize: '18px', fontWeight: '600', lineHeight: '1.4' };
    
    const speakerStyle = { 
        display: 'flex', alignItems: 'center', color: '#444', fontSize: '14px', marginBottom: '10px', fontStyle: 'italic' 
    };

    const abstractStyle = { margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' };

    const dateHeaderStyle = { 
        marginTop: '40px', marginBottom: '15px', color: '#495057', fontSize: '20px', 
        fontWeight: '700', paddingLeft: '10px', borderLeft: '4px solid #003366' 
    };

    const emptyStateStyle = {
        textAlign: 'center', padding: '60px', background: '#f8f9fa', 
        border: '1px solid #dee2e6', borderRadius: '6px', color: '#6c757d'
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color: '#666'}}>Загрузка расписания...</div>;

    return (
        <div style={{ background: '#fdfdfd', minHeight: '100vh', paddingBottom: '50px' }}>
            <Navbar />
            <div style={containerStyle}>
                
                {/* ХЕДЕР СТРАНИЦЫ */}
                <div style={headerBlockStyle}>
                    <h1 style={pageTitleStyle}>
                        <IconCalendar /> Программа конференции
                    </h1>
                    
                    <div style={filterBoxStyle}>
                        <span style={{ fontSize: '13px', color: '#555', marginRight: '10px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                            <IconFilter /> Секция:
                        </span>
                        <select 
                            style={selectStyle}
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="all">Все направления</option>
                            {uniqueSections.filter(s => s !== 'all').map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* КОНТЕНТ */}
                {filteredSchedule.length === 0 ? (
                    <div style={emptyStateStyle}>
                        {schedule.length === 0 
                            ? "Расписание формируется. Следите за обновлениями." 
                            : "В выбранной секции нет запланированных выступлений."}
                    </div>
                ) : (
                    <div>
                        {filteredSchedule.map((item, index) => {
                            const currentDate = formatDate(item.start_time);
                            const prevDate = index > 0 ? formatDate(filteredSchedule[index - 1].start_time) : null;
                            const showDateHeader = currentDate !== prevDate;

                            return (
                                <React.Fragment key={item.id}>
                                    {showDateHeader && (
                                        <div style={dateHeaderStyle}>
                                            {currentDate}
                                        </div>
                                    )}

                                    <div style={cardStyle}>
                                        {/* Левая колонка: Время */}
                                        <div style={timeBlockStyle}>
                                            <div style={timeStyle}>
                                                {formatTimeRange(item.start_time, item.duration)}
                                            </div>
                                            <div style={durationStyle}>
                                                {item.duration} мин
                                            </div>
                                        </div>

                                        {/* Правая колонка: Инфо */}
                                        <div style={contentBlockStyle}>
                                            <div style={metaRowStyle}>
                                                <span style={sectionBadgeStyle}>{item.section_name}</span>
                                                {item.room && (
                                                    <span style={roomBadgeStyle}>
                                                        <IconMapPin /> Ауд. {item.room}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 style={titleStyle}>{item.title}</h3>
                                            
                                            <div style={speakerStyle}>
                                                <IconUser />
                                                <span>{item.speaker_name}</span>
                                            </div>
                                            
                                            <p style={abstractStyle}>{item.abstract}</p>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
