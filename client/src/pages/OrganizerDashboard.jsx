import React, { useState, useEffect } from 'react';

const OrganizerDashboard = ({ activeTab }) => {
    // --- ДАННЫЕ ---
    const [sections, setSections] = useState([]);
    const [users, setUsers] = useState([]);
    const [schedule, setSchedule] = useState([]); 
    const [readyToPublish, setReadyToPublish] = useState([]); 
    const [newsList, setNewsList] = useState([]); 
    const [statistics, setStatistics] = useState(null);
    
    // --- UI СОСТОЯНИЯ ---
    const [loading, setLoading] = useState(true);

    // --- ФОРМЫ ---
    const [newTitle, setNewTitle] = useState("");
    const [newRoom, setNewRoom] = useState(""); 
    const [selectedManager, setSelectedManager] = useState("");
    
    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");

    // --- ФИЛЬТРЫ ---
    const [scheduleFilter, setScheduleFilter] = useState("all");
    const [publishFilter, setPublishFilter] = useState("all");

    // --- РЕДАКТИРОВАНИЕ ---
    const [editingSectionId, setEditingSectionId] = useState(null); 
    const [editFormData, setEditFormData] = useState({ title: "", room: "", manager_id: "" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const headers = { token: localStorage.token };
            const [resSec, resUsers, resSched, resPublish, resNews, resStats] = await Promise.all([
                fetch("http://localhost:5000/api/organizer/sections", { headers }),
                fetch("http://localhost:5000/api/organizer/users", { headers }),
                fetch("http://localhost:5000/api/organizer/schedule", { headers }),
                fetch("http://localhost:5000/api/organizer/publish-list", { headers }),
                fetch("http://localhost:5000/api/organizer/news", { headers }),
                fetch("http://localhost:5000/api/organizer/statistics", { headers })
            ]);

            if (resSec.ok) setSections(await resSec.json());
            if (resUsers.ok) setUsers(await resUsers.json());
            if (resSched.ok) setSchedule(await resSched.json());
            if (resPublish.ok) setReadyToPublish(await resPublish.json());
            if (resNews.ok) setNewsList(await resNews.json());
            if (resStats.ok) setStatistics(await resStats.json());

            setSelectedManager(""); 
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // --- API ФУНКЦИИ ---
    const createSection = async (e) => {
        e.preventDefault();
        try {
            const body = { title: newTitle, conference_id: 1, manager_id: selectedManager, room: newRoom };
            const response = await fetch("http://localhost:5000/api/organizer/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                alert("Секция успешно создана");
                setNewTitle(""); setNewRoom(""); setSelectedManager("");
                loadData();
            }
        } catch (err) { console.error(err); }
    };

    const startEditing = (sec) => {
        setEditingSectionId(sec.id);
        setEditFormData({ title: sec.title, room: sec.room || "", manager_id: sec.manager_id || "" });
    };

    const cancelEditing = () => {
        setEditingSectionId(null);
    };

    const saveSectionChanges = async (id) => {
        try {
            const headers = { "Content-Type": "application/json", token: localStorage.token };
            await fetch(`http://localhost:5000/api/organizer/sections/${id}/info`, {
                method: "PUT", headers, body: JSON.stringify({ title: editFormData.title, room: editFormData.room })
            });
            await fetch(`http://localhost:5000/api/organizer/sections/${id}/manager`, {
                method: "PUT", headers, body: JSON.stringify({ manager_id: editFormData.manager_id })
            });
            setEditingSectionId(null);
            loadData();
        } catch (err) { alert("Ошибка при сохранении"); }
    };

    // [ОБНОВЛЕНО] Функция назначения ДНЯ (вместо saveSchedule)
    // [ИСПРАВЛЕНО] Функция назначения ДАТЫ СЕКЦИИ
    const assignDay = async (id, date) => {
        try {
            const response = await fetch(`http://localhost:5000/api/organizer/sections/${id}/date`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ section_date: date })
            });
            if (response.ok) { 
                alert("Дата секции сохранена"); 
                loadData(); 
            } else {
                alert("Ошибка при сохранении даты");
            }
        } catch (err) { console.error(err); }
    };


    const changeRole = async (userId, newRoleId) => {
        if (!window.confirm("Вы уверены?")) return;
        try {
            const response = await fetch("http://localhost:5000/api/organizer/role", {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ userId, roleId: newRoleId })
            });
            if (response.ok) loadData();
        } catch (err) { console.error(err); }
    };

    const handlePublish = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/organizer/publish/${id}`, {
                method: "PUT", headers: { token: localStorage.token }
            });
            if (res.ok) {
                setReadyToPublish(prev => prev.map(item => item.id === id ? { ...item, status: 'published' } : item));
            }
        } catch (err) { console.error(err); }
    };

    const createNews = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/organizer/news", {
                method: "POST",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ title: newsTitle, content: newsContent })
            });
            if (res.ok) {
                setNewsTitle(""); setNewsContent(""); loadData();
                alert("Новость опубликована!");
            }
        } catch (err) { console.error(err); }
    };

    const deleteNews = async (id) => {
        if(!window.confirm("Удалить новость?")) return;
        try {
            await fetch(`http://localhost:5000/api/organizer/news/${id}`, {
                method: "DELETE", headers: { token: localStorage.token }
            });
            loadData();
        } catch (err) { console.error(err); }
    };

    // --- ФИЛЬТРАЦИЯ ---
    const filteredSchedule = scheduleFilter === "all" ? schedule : schedule.filter(item => item.section_name === scheduleFilter);
    const filteredPublishList = publishFilter === "all" ? readyToPublish : readyToPublish.filter(item => item.section_name === publishFilter);

    // --- ИКОНКИ (Lucide Style) ---
    const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
    const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
    const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
    const IconInfo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 12, minWidth: '20px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
    const IconPrinter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;

    // --- СТИЛИ ---
    const containerStyle = { fontFamily: 'Arial, sans-serif' };
    const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' };
    const infoBoxStyle = { marginBottom: '20px', display: 'flex', alignItems: 'center', background: '#e8f4fd', padding: '16px', borderRadius: '6px', border: '1px solid #b6d4fe' };
    const formBoxStyle = { background: '#f8f9fa', padding: '20px', border: '1px solid #dee2e6', marginBottom: '25px', borderRadius: '6px' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
    const thStyle = { background: '#f1f3f5', padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' };
    const tdStyle = { padding: '16px 15px', borderBottom: '1px solid #e9ecef', verticalAlign: 'middle', color: '#212529' };
    const btnAction = (type) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 14px', border: '1px solid transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
        background: type === 'primary' ? '#0056b3' : type === 'success' ? '#198754' : type === 'danger' ? '#dc3545' : 'transparent',
        color: type === 'outline' ? '#0056b3' : 'white', borderColor: type === 'outline' ? '#0056b3' : 'transparent', marginRight: '8px', transition: 'all 0.2s'
    });
    const inputStyle = { padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', width: '100%', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '12px', color: '#495057', marginBottom: '6px', fontWeight: '700', textTransform:'uppercase' };

    if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#666'}}>Загрузка данных...</div>;

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h2 style={{margin: 0, color: '#333', fontSize: '24px', fontWeight: '600'}}>Панель Организатора</h2>
            </div>
            
            <div style={{ minHeight: '400px' }}>
                
                {/* 1. СЕКЦИИ */}
                {activeTab === 'sections' && (
                    <div>
                        <div style={formBoxStyle}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color:'#003366' }}>Создание секции</h4>
                            <form onSubmit={createSection} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
                                <div>
                                    <label style={labelStyle}>Название секции</label>
                                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Аудитория</label>
                                    <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} style={inputStyle} placeholder="Напр. 201" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Ответственный</label>
                                    <select value={selectedManager} onChange={e => setSelectedManager(e.target.value)} style={inputStyle}>
                                        <option value="">Не назначен</option>
                                        {users.filter(u => u.role_id === 1).map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" style={btnAction('success')}><IconPlus /> Создать</button>
                            </form>
                        </div>

                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Название</th>
                                    <th style={thStyle}>Место проведения</th>
                                    <th style={thStyle}>Администратор</th>
                                    <th style={thStyle} width="220">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map(sec => (
                                    <tr key={sec.id}>
                                        <td style={tdStyle}>
                                            {editingSectionId === sec.id ? (
                                                <input style={inputStyle} value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
                                            ) : <span style={{fontWeight:'600', color:'#333'}}>{sec.title}</span>}
                                        </td>
                                        <td style={tdStyle}>
                                            {editingSectionId === sec.id ? (
                                                <input style={inputStyle} value={editFormData.room} onChange={e => setEditFormData({...editFormData, room: e.target.value})} />
                                            ) : (sec.room || "—")}
                                        </td>
                                        <td style={tdStyle}>
                                            {editingSectionId === sec.id ? (
                                                <select value={editFormData.manager_id} onChange={e => setEditFormData({...editFormData, manager_id: e.target.value})} style={inputStyle}>
                                                    <option value="">Не назначен</option>
                                                    {users.filter(u => u.role_id === 1).map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                                                </select>
                                            ) : (sec.manager_name || "—")}
                                        </td>
                                        <td style={tdStyle}>
                                            {editingSectionId === sec.id ? (
                                                <div style={{display:'flex'}}>
                                                    <button onClick={() => saveSectionChanges(sec.id)} style={btnAction('success')}><IconCheck /> Сохранить</button>
                                                    <button onClick={cancelEditing} style={btnAction('outline')}><IconX /> Отмена</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEditing(sec)} style={btnAction('outline')}><IconEdit /> Редактировать</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. ПОЛЬЗОВАТЕЛИ */}
                {activeTab === 'users' && (
                    <div>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Пользователь</th>
                                    <th style={thStyle}>Текущая роль</th>
                                    <th style={thStyle}>Управление правами</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={tdStyle}>
                                            <div style={{fontWeight:'bold', color:'#333'}}>{u.full_name}</div>
                                            <div style={{fontSize:'13px', color:'#666'}}>{u.email}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'600',
                                                background: u.role_id === 1 ? '#e0cffc' : u.role_id === 2 ? '#ffeeba' : '#e2e3e5',
                                                color: u.role_id === 1 ? '#432874' : u.role_id === 2 ? '#856404' : '#383d41'
                                            }}>
                                                {u.role_id === 1 && "Администратор"}
                                                {u.role_id === 2 && "Организатор"}
                                                {u.role_id === 3 && "Участник"}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {u.role_id !== 2 && (
                                                <div style={{display:'flex'}}>
                                                    <button onClick={() => changeRole(u.id, 1)} disabled={u.role_id === 1} style={{...btnAction('outline'), opacity: u.role_id === 1 ? 0.5 : 1}}>
                                                        Назначить Админом
                                                    </button>
                                                    <button onClick={() => changeRole(u.id, 3)} disabled={u.role_id === 3} style={{...btnAction('outline'), opacity: u.role_id === 3 ? 0.5 : 1}}>
                                                        Сделать Участником
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. РАСПИСАНИЕ (УПРАВЛЕНИЕ ДАТАМИ СЕКЦИЙ) */}
{activeTab === 'schedule' && (
    <div>
        <div style={infoBoxStyle}>
            <IconInfo />
            <div style={{marginRight: 'auto', color: '#004085', fontSize: '14px', lineHeight: '1.4'}}>
                <strong>График конференции.</strong> Назначьте дату проведения для каждой секции.
                <br/>Администраторы будут распределять доклады внутри этой даты.
            </div>
        </div>
        
        {/* Если секций нет, покажем сообщение */}
        {sections.length === 0 ? (
            <div style={{padding:'40px', textAlign:'center', color:'#999', border:'2px dashed #eee'}}>
                Секций пока нет. Создайте их на первой вкладке.
            </div>
        ) : (
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Название секции</th>
                        <th style={thStyle}>Ответственный (Админ)</th>
                        <th style={thStyle}>Дата проведения</th>
                        <th style={thStyle}>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    {sections.map(sec => (
                        <tr key={sec.id}>
                            <td style={tdStyle}>
                                <div style={{fontWeight:'600', color:'#333', fontSize:'14px'}}>{sec.title}</div>
                                <div style={{fontSize:'12px', color:'#777'}}>Ауд. {sec.room || "—"}</div>
                            </td>
                            <td style={tdStyle}>
                                {sec.manager_name ? (
                                    <span style={{color:'#0056b3', fontWeight:'500', background:'#e7f5ff', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}}>
                                        {sec.manager_name}
                                    </span>
                                ) : (
                                    <span style={{color:'#999', fontStyle:'italic', fontSize:'12px'}}>Не назначен</span>
                                )}
                            </td>
                            <td style={tdStyle}>
                                <input 
                                    type="date" 
                                    id={`date-sec-${sec.id}`}
                                    // Если дата уже есть в БД, подставляем её (обрезая время T00:00:00.000Z)
                                    defaultValue={sec.section_date ? sec.section_date.split('T')[0] : ""}
                                    style={inputStyle} 
                                />
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => {
                                    const d = document.getElementById(`date-sec-${sec.id}`).value;
                                    if(!d) return alert("Выберите дату!");
                                    assignDay(sec.id, d); // Вызываем нашу новую функцию
                                }}
                                style={btnAction('primary')}>
                                    <IconCheck /> Сохранить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
)}


                {/* 4. ПУБЛИКАЦИЯ */}
                {activeTab === 'publish' && (
                    <div>
                        <div style={{...infoBoxStyle, background: '#e8f5e9', border: '1px solid #c3e6cb'}}>
                             <IconInfo />
                            <div style={{marginRight: 'auto', color: '#155724', fontSize: '14px', lineHeight: '1.4'}}>
                                <strong>Публикация докладов.</strong> Опубликованные доклады появятся на главной странице сайта.
                            </div>
                            <select 
                                value={publishFilter} 
                                onChange={(e) => setPublishFilter(e.target.value)}
                                style={{padding: '8px 12px', borderRadius: '4px', minWidth: '220px', border: '1px solid #c3e6cb', color: '#155724', fontWeight: '500', cursor:'pointer'}}
                            >
                                <option value="all">Все секции</option>
                                {[...new Set(readyToPublish.map(item => item.section_name))].map(secName => (
                                    <option key={secName} value={secName}>{secName}</option>
                                ))}
                            </select>
                        </div>

                        {filteredPublishList.length === 0 ? (
                            <div style={{padding:'50px', textAlign:'center', color:'#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px'}}>
                                {readyToPublish.length === 0 ? "Нет докладов для публикации." : "Нет докладов в выбранной секции."}
                            </div>
                        ) : (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Секция</th>
                                        <th style={thStyle}>Автор</th>
                                        <th style={thStyle}>Тема доклада</th>
                                        <th style={thStyle}>Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPublishList.map(sub => (
                                        <tr key={sub.id} style={{ background: sub.status === 'published' ? '#fcfcfc' : 'white' }}>
                                            <td style={tdStyle}><span style={{fontWeight:'600', fontSize:'13px'}}>{sub.section_name}</span></td>
                                            <td style={tdStyle}>{sub.author_name}</td>
                                            <td style={tdStyle} width="35%">{sub.title}</td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {sub.file_url ? (
                                                        <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noopener noreferrer" style={{...btnAction('outline'), textDecoration: 'none', display: 'flex', alignItems: 'center', padding:'4px 10px', fontSize:'12px'}} title="Скачать файл">
                                                            <IconDownload /> Файл
                                                        </a>
                                                    ) : <span style={{fontSize: '12px', color: '#999', padding: '0 5px'}}>Нет файла</span>}

                                                    {sub.status === 'published' ? (
                                                        <span style={{ color: '#155724', fontWeight: 'bold', fontSize: '12px', border: '1px solid #c3e6cb', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', background: '#d4edda' }}>
                                                            <IconCheck /> Опубликован
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => handlePublish(sub.id)} style={btnAction('success')}>Опубликовать</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* 5. НОВОСТИ */}
                {activeTab === 'news' && (
                    <div>
                        <div style={formBoxStyle}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color:'#003366' }}>Добавить новость</h4>
                            <form onSubmit={createNews}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={labelStyle}>Заголовок</label>
                                    <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Текст новости</label>
                                    <textarea rows="4" value={newsContent} onChange={e => setNewsContent(e.target.value)} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} required />
                                </div>
                                <button type="submit" style={btnAction('success')}><IconPlus /> Опубликовать</button>
                            </form>
                        </div>

                        <h4 style={{ margin: '0 0 15px 0', color:'#333' }}>Список новостей ({newsList.length})</h4>
                        {newsList.length === 0 ? (
                            <div style={{padding:'40px', textAlign:'center', color:'#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px'}}>Новостей пока нет.</div>
                        ) : (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Дата</th>
                                        <th style={thStyle}>Заголовок</th>
                                        <th style={thStyle}>Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newsList.map(n => (
                                        <tr key={n.id}>
                                            <td style={tdStyle} width="120">{new Date(n.created_at).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                <strong style={{color:'#333', fontSize:'15px'}}>{n.title}</strong>
                                                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666', lineHeight:'1.4' }}>{n.content.slice(0, 100)}...</p>
                                            </td>
                                            <td style={tdStyle} width="120">
                                                <button onClick={() => deleteNews(n.id)} style={btnAction('danger')}><IconTrash /> Удалить</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* 6. СТАТИСТИКА */}
                {activeTab === 'statistics' && (
                    <div className="print-area">
                        <div style={{...infoBoxStyle, justifyContent: 'space-between'}} className="no-print">
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <IconInfo />
                                <div style={{color: '#004085', fontSize: '14px', lineHeight: '1.4'}}>
                                    <strong>Статистика.</strong> Обзор данных по активной конференции.
                                </div>
                            </div>
                            <button className="no-print" style={btnAction('primary')} onClick={() => window.print()}>
                                <IconPrinter /> Распечатать отчет
                            </button>
                        </div>

                        {/* Заголовок для печати */}
                        <div style={{ display: 'none', marginBottom: '20px', textAlign: 'center' }} className="print-only">
                            <h2 style={{ fontSize: '24px', color: '#003366', margin: '0 0 10px 0' }}>Статистический отчет по конференции</h2>
                            <p style={{ color: '#666', margin: 0 }}>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</p>
                        </div>

                        {statistics ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                {/* Блок: Пользователи */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Пользователи платформы</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '15px' }}>
                                        {statistics.users.map((u, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <span style={{ color: '#555' }}>{u.role_id === 1 ? 'Администраторы' : u.role_id === 2 ? 'Организаторы' : 'Участники'}</span>
                                                <strong style={{ color: '#333' }}>{u.count}</strong>
                                            </li>
                                        ))}
                                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                            <span style={{ color: '#003366', fontWeight: 'bold' }}>Всего:</span>
                                            <strong style={{ color: '#003366', fontWeight: 'bold' }}>{statistics.users.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</strong>
                                        </li>
                                    </ul>
                                </div>

                                {/* Блок: Статусы заявок и Acceptance Rate */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Статусы докладов</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '15px' }}>
                                        {statistics.submissions.length === 0 ? <li style={{color: '#999', padding:'10px 0'}}>Нет поданных докладов</li> : null}
                                        {statistics.submissions.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <span style={{ color: '#555' }}>
                                                    {s.status === 'accepted' ? 'Приняты ✅' : s.status === 'published' ? 'Опубликованы 🌟' : s.status === 'rejected' ? 'Отклонены ❌' : 'На проверке ⏳'}
                                                </span>
                                                <strong style={{ color: '#333' }}>{s.count}</strong>
                                            </li>
                                        ))}
                                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                            <span style={{ color: '#003366', fontWeight: 'bold' }}>Всего:</span>
                                            <strong style={{ color: '#003366', fontWeight: 'bold' }}>{statistics.submissions.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</strong>
                                        </li>
                                    </ul>
                                    {/* ACCEPTANCE RATE */}
                                    {statistics.submissions.length > 0 && (
                                        <div style={{ marginTop: '20px', padding: '15px', background: '#e7f5ff', borderRadius: '6px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '13px', color: '#0056b3', textTransform: 'uppercase', fontWeight: '600' }}>Acceptance Rate</div>
                                            <div style={{ fontSize: '28px', color: '#003366', fontWeight: 'bold', margin: '5px 0' }}>
                                                {(() => {
                                                    const total = statistics.submissions.reduce((acc, curr) => acc + parseInt(curr.count), 0);
                                                    const accepted = statistics.submissions.filter(s => s.status === 'accepted' || s.status === 'published').reduce((acc, curr) => acc + parseInt(curr.count), 0);
                                                    return total === 0 ? '0%' : Math.round((accepted / total) * 100) + '%';
                                                })()}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>доля принятых докладов</div>
                                        </div>
                                    )}
                                </div>

                                {/* Блок: Распределение по секциям */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Доклады по секциям</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '15px' }}>
                                        {statistics.sections.length === 0 ? <li style={{color: '#999', padding:'10px 0'}}>Нет активных секций</li> : null}
                                        {statistics.sections.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <span style={{ color: '#555', wordBreak: 'break-word', paddingRight: '15px' }}>{s.title}</span>
                                                <strong style={{ color: '#333' }}>{s.count}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Блок: Нагрузка на администраторов */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Нагрузка модераторов</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                                        {(!statistics.adminLoad || statistics.adminLoad.length === 0) ? <li style={{color: '#999', padding:'10px 0'}}>Администраторы не назначены</li> : null}
                                        {statistics.adminLoad && statistics.adminLoad.map((al, i) => (
                                            <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', color: '#333' }}>{al.admin_name}</span>
                                                    <span style={{ color: '#555' }}>Всего: {al.total_submissions}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                    <span style={{ color: '#888' }}>{al.section_name}</span>
                                                    <span style={{ color: parseInt(al.pending_submissions) > 0 ? '#dc3545' : '#28a745', fontWeight: '600' }}>
                                                        Ожидают: {al.pending_submissions || 0}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Блок: Динамика подачи заявок */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Динамика подачи заявок</h4>
                                    
                                    {(!statistics.timeline || statistics.timeline.length === 0) ? (
                                        <div style={{color: '#999', padding:'10px 0'}}>Нет данных по датам</div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '8px', padding: '10px 0', overflowX: 'auto' }}>
                                            {statistics.timeline.map((t, i) => {
                                                const maxCount = Math.max(...statistics.timeline.map(x => parseInt(x.count)));
                                                const heightPercent = maxCount === 0 ? 0 : (parseInt(t.count) / maxCount) * 100;
                                                return (
                                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px', flex: 1 }}>
                                                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>{t.count}</div>
                                                        <div style={{ 
                                                            width: '100%', 
                                                            height: `${Math.max(10, heightPercent)}%`, 
                                                            background: 'linear-gradient(180deg, #4dabf7 0%, #228be6 100%)', 
                                                            borderRadius: '4px 4px 0 0',
                                                            transition: 'height 0.3s ease'
                                                        }}></div>
                                                        <div style={{ fontSize: '10px', color: '#888', marginTop: '5px', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', marginTop: '10px' }}>
                                                            {new Date(t.date).toLocaleDateString('ru-RU', {day:'2-digit', month:'2-digit'})}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Загрузка статистики...</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerDashboard;
