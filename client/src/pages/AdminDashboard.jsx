import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ activeTab }) => {
    // --- ДАННЫЕ ---
    const [sections, setSections] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- UI СОСТОЯНИЯ ---
    const [appFilterId, setAppFilterId] = useState('all'); 
    const [scheduleFilterId, setScheduleFilterId] = useState(''); 

    // --- ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/dashboard", {
                headers: { token: localStorage.token }
            });
            if (response.ok) {
                const data = await response.json();
                const loadedSections = data.sections || [];
                setSections(loadedSections);
                setSubmissions(data.submissions || []);
                
                // Если секции есть, сразу выбираем первую для фильтра расписания
                if (loadedSections.length > 0 && !scheduleFilterId) {
                    setScheduleFilterId(loadedSections[0].id.toString());
                }
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    // --- API ДЕЙСТВИЯ ---

    // 1. Принять/Отклонить заявку
    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/submissions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                // Обновляем локально, чтобы не перезагружать всю страницу
                setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
            }
        } catch (err) { console.error(err); }
    };

    // 2. Сохранить время выступления
    const saveSchedule = async (id, fullDateTime, duration) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/schedule/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ start_time: fullDateTime, duration: parseInt(duration) })
            });
            if (response.ok) { 
                alert("Расписание обновлено"); 
                loadData(); // Перезагружаем данные - таблица автоматически пересортируется
            } else { 
                const msg = await response.json();
                alert(`Ошибка: ${msg}`); 
            }
        } catch (err) { alert("Ошибка сети"); }
    };

    // 3. Скачать файл
    const handleDownload = async (fileUrl) => {
        try {
            const filename = fileUrl.split('/').pop();
            const res = await fetch(`http://localhost:5000/api/submissions/download/${filename}`, {
                headers: { token: localStorage.token }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); a.remove();
                window.URL.revokeObjectURL(url);
            } else { alert("Не удалось скачать файл."); }
        } catch (err) { console.error(err); }
    };

    // --- ФИЛЬТРАЦИЯ И СОРТИРОВКА ---
    
    // Для вкладки "Заявки"
    const applicationsData = appFilterId === 'all' 
        ? submissions 
        : submissions.filter(s => s.section_id === parseInt(appFilterId));

    // Для вкладки "Расписание" (с сортировкой по времени)
    const scheduleData = submissions
        .filter(s => s.section_id === parseInt(scheduleFilterId) && s.status === 'accepted')
        .sort((a, b) => {
            // Те, у кого время уже назначено - выше. Внутри сортируем по возрастанию.
            if (!a.start_time && !b.start_time) return 0;
            if (!a.start_time) return 1; // Без времени - вниз
            if (!b.start_time) return -1;
            return new Date(a.start_time) - new Date(b.start_time);
        });

    // --- ИКОНКИ (Lucide Style) ---
    const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
    const IconInfo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, minWidth: '20px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

    // --- СТИЛИ ---
    const containerStyle = { fontFamily: 'Arial, sans-serif' };
    const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' };
    const infoBoxStyle = { marginBottom: '20px', display: 'flex', alignItems: 'center', background: '#e8f4fd', padding: '16px', borderRadius: '6px', border: '1px solid #b6d4fe' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
    const thStyle = { background: '#f1f3f5', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' };
    const tdStyle = { padding: '16px 15px', borderBottom: '1px solid #e9ecef', verticalAlign: 'middle', color: '#212529' };
    const btnAction = (type) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 14px', border: '1px solid transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
        background: type === 'accept' ? '#198754' : type === 'save' ? '#0056b3' : '#dc3545',
        color: 'white', marginRight: '8px', transition: 'opacity 0.2s'
    });
    const badgeStyle = (type) => ({
        padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'inline-block',
        background: type === 'pending' ? '#fff3cd' : type === 'accepted' ? '#d1e7dd' : type === 'published' ? '#e2e3e5' : '#f8d7da',
        color: type === 'pending' ? '#856404' : type === 'accepted' ? '#0f5132' : type === 'published' ? '#383d41' : '#842029',
        border: `1px solid ${type === 'pending' ? '#ffeeba' : type === 'accepted' ? '#badbcc' : type === 'published' ? '#d6d8db' : '#f5c6cb'}`
    });
    const inputStyle = { padding: '8px 10px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', width: '100%', outline: 'none' };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color: '#666'}}>Загрузка данных...</div>;

    if (sections.length === 0) {
        return (
            <div style={containerStyle}>
                <h3 style={{margin: 0, color: '#333'}}>Панель Администратора</h3>
                <div style={{marginTop: '20px', padding: '20px', background: '#f8f9fa'}}>Вам не назначены секции.</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h3 style={{margin: 0, color: '#333', fontSize: '24px', fontWeight: '600'}}>Управление Секцией</h3>
            </div>

            {/* ВКЛАДКА ЗАЯВКИ */}
            {activeTab === 'applications' && (
                <div>
                    <div style={infoBoxStyle}>
                        <IconInfo />
                        <div style={{marginRight: 'auto', color: '#004085', fontSize: '14px', lineHeight: '1.4'}}>
                            <strong>Модерация заявок.</strong> Одобренные доклады попадут в список для составления расписания.
                        </div>
                        <select 
                            value={appFilterId} 
                            onChange={e => setAppFilterId(e.target.value)} 
                            style={{padding: '8px 12px', borderRadius: '4px', minWidth: '220px', border: '1px solid #b6d4fe', color: '#004085', fontWeight: '500', cursor:'pointer'}}
                        >
                            <option value="all">Все мои секции</option>
                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                        </select>
                    </div>

                    {applicationsData.length === 0 ? (
                        <div style={{padding:'50px', textAlign:'center', color:'#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px'}}>
                            Заявок не найдено.
                        </div>
                    ) : (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Доклад</th>
                                    <th style={thStyle}>Автор / Секция</th>
                                    <th style={thStyle}>Статус</th>
                                    <th style={thStyle}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicationsData.map(sub => (
                                    <tr key={sub.id}>
                                        <td style={tdStyle} width="40%">
                                            <div style={{fontWeight:'700', color:'#003366', marginBottom:'6px', fontSize: '15px'}}>{sub.title}</div>
                                            <div style={{fontSize:'13px', color:'#555', lineHeight: '1.5'}}>{(sub.abstract || "").slice(0, 100)}...</div>
                                            {sub.file_url && (
                                                <button onClick={() => handleDownload(sub.file_url)} style={{...btnAction('save'), background:'transparent', color:'#0056b3', border:'1px solid #0056b3', marginTop:'12px', padding:'6px 12px'}}>
                                                    <IconDownload /> Скачать материал
                                                </button>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{fontWeight:'600', color:'#333'}}>{sub.speaker_name}</div>
                                            <div style={{fontSize:'13px', color:'#666', marginBottom:'4px'}}>{sub.email}</div>
                                            <div style={{fontSize:'12px', color:'#0056b3', fontWeight: '600', background: '#e7f5ff', display:'inline-block', padding:'2px 6px', borderRadius:'4px'}}>{sub.section_name}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(sub.status)}>
                                                {sub.status === 'pending' ? 'На проверке' : sub.status === 'accepted' ? 'Принят' : sub.status === 'published' ? 'Опубликован' : 'Отклонен'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {sub.status === 'pending' ? (
                                                <div style={{ display: 'flex' }}>
                                                    <button style={btnAction('accept')} onClick={() => updateStatus(sub.id, 'accepted')} title="Принять"><IconCheck /> Принять</button>
                                                    <button style={btnAction('reject')} onClick={() => updateStatus(sub.id, 'rejected')} title="Отказать"><IconX /> Отказать</button>
                                                </div>
                                            ) : (
                                                <span style={{fontSize:'13px', color:'#868e96', fontStyle:'italic'}}>Решение принято</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ВКЛАДКА РАСПИСАНИЕ (ОБНОВЛЕНО: key для автоматического обновления) */}
            {activeTab === 'schedule' && (
                <div>
                    <div style={infoBoxStyle}>
                        <IconInfo />
                        <div style={{marginRight: 'auto', color: '#004085', fontSize: '14px', lineHeight: '1.4'}}>
                             <strong>Расписание секции.</strong> Выберите секцию и выставите время докладов внутри назначенных дней.
                        </div>
                        <select 
                            value={scheduleFilterId} 
                            onChange={e => setScheduleFilterId(e.target.value)} 
                            style={{padding: '8px 12px', borderRadius: '4px', minWidth: '220px', border: '1px solid #b6d4fe', color: '#004085', fontWeight: '500', cursor:'pointer'}}
                        >
                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                        </select>
                    </div>

                    {scheduleData.length === 0 ? (
                        <div style={{padding:'50px', textAlign:'center', color:'#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px'}}>
                            Нет принятых докладов в этой секции.
                        </div>
                    ) : (
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Доклад</th>
                                    <th style={thStyle}>Дата выступления</th>
                                    <th style={thStyle}>Время начала</th>
                                    <th style={thStyle}>Длит. (мин)</th>
                                    <th style={thStyle}>Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduleData.map(sub => {
                                    // Логика отображения даты
                                    const assignedDate = sub.scheduled_day 
                                        ? new Date(sub.scheduled_day).toLocaleDateString() 
                                        : <span style={{color:'red', fontWeight:'bold'}}>Не назначена</span>;
                                    
                                    // [ИСПРАВЛЕНО] Логика времени: Берем локальное время
                                    let displayTime = "";
                                    if (sub.start_time) {
                                        const dateObj = new Date(sub.start_time);
                                        const hours = dateObj.getHours().toString().padStart(2, '0');
                                        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                                        displayTime = `${hours}:${minutes}`;
                                    }

                                    return (
                                        <tr key={sub.id}>
                                            <td style={tdStyle} width="35%">
                                                <div style={{fontWeight:'700', color:'#333', fontSize: '15px'}}>{sub.title}</div>
                                                <div style={{fontSize:'13px', color:'#666', marginTop:'4px'}}>{sub.speaker_name}</div>
                                            </td>
                                            <td style={tdStyle} width="15%">
                                                {assignedDate}
                                            </td>
                                            <td style={tdStyle} width="20%">
                                                {/* [ДОБАВЛЕН key] При изменении displayTime инпут пересоздается */}
                                                <input 
                                                    key={`time-${sub.id}-${displayTime}`}
                                                    type="time" 
                                                    id={`time-${sub.id}`}
                                                    defaultValue={displayTime}
                                                    disabled={!sub.scheduled_day}
                                                    style={inputStyle} 
                                                />
                                            </td>
                                            <td style={tdStyle} width="10%">
                                                <input 
                                                    key={`dur-${sub.id}-${sub.duration}`}
                                                    type="number" 
                                                    id={`dur-${sub.id}`}
                                                    defaultValue={sub.duration || 15}
                                                    disabled={!sub.scheduled_day}
                                                    style={inputStyle} 
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <button 
                                                    onClick={() => {
                                                        const timeVal = document.getElementById(`time-${sub.id}`).value;
                                                        const durVal = document.getElementById(`dur-${sub.id}`).value;
                                                        
                                                        if (!sub.scheduled_day) return alert("Организатор еще не назначил дату!");
                                                        if (!timeVal) return alert("Выберите время!");

                                                        const datePart = sub.scheduled_day.split('T')[0];
                                                        const fullDateTime = `${datePart}T${timeVal}:00`; 

                                                        saveSchedule(sub.id, fullDateTime, durVal);
                                                    }}
                                                    disabled={!sub.scheduled_day}
                                                    style={{...btnAction('save'), opacity: !sub.scheduled_day ? 0.5 : 1}}
                                                >
                                                    <IconCheck /> Сохранить
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
