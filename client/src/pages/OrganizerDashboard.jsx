import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ConferenceInfoBlock from '../components/ConferenceInfoBlock';

const OrganizerDashboard = ({ activeTab, activeConference }) => {
    // --- ДАННЫЕ ---
    const [sections, setSections] = useState([]);
    const [users, setUsers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [readyToPublish, setReadyToPublish] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [conferences, setConferences] = useState([]);

    // --- UI СОСТОЯНИЯ ---
    const [loading, setLoading] = useState(true);
    const [showConfForm, setShowConfForm] = useState(false);
    const [showSecForm, setShowSecForm] = useState(false);

    // --- ФОРМЫ ---
    const [newTitle, setNewTitle] = useState("");
    const [newRoom, setNewRoom] = useState("");
    const [managersText, setManagersText] = useState("");

    const [newsTitle, setNewsTitle] = useState("");
    const [newsContent, setNewsContent] = useState("");

    // --- ФИЛЬТРЫ ---
    const [scheduleFilter, setScheduleFilter] = useState("all");
    const [publishFilter, setPublishFilter] = useState("all");
    const [userSearchQuery, setUserSearchQuery] = useState("");

    // --- РЕДАКТИРОВАНИЕ ---
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: "", room: "", managers_text: "" });
    const [editingConference, setEditingConference] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const headers = { token: localStorage.token };
            const [resSec, resUsers, resSched, resPublish, resNews, resStats, resConf] = await Promise.all([
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/sections", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/users", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/schedule", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/publish-list", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/news", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/statistics", { headers }),
                fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/conferences", { headers })
            ]);

            if (resSec.ok) setSections(await resSec.json());
            if (resUsers.ok) setUsers(await resUsers.json());
            if (resSched.ok) setSchedule(await resSched.json());
            if (resPublish.ok) setReadyToPublish(await resPublish.json());
            if (resNews.ok) setNewsList(await resNews.json());
            if (resStats.ok) setStatistics(await resStats.json());
            if (resConf.ok) setConferences(await resConf.json());

            setManagersText("");
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
            if (!activeConference) {
                alert("Нет активной конференции! Создание секций невозможно.");
                return;
            }
            const body = { title: newTitle, conference_id: activeConference.id, managers_text: managersText, room: newRoom };
            const response = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/sections", {
                method: "POST",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                alert("Секция успешно создана");
                setNewTitle(""); setNewRoom(""); setManagersText("");
                loadData();
            }
        } catch (err) { console.error(err); }
    };

    const startEditing = (sec) => {
        setEditingSectionId(sec.id);
        setEditFormData({ title: sec.title, room: sec.room || "", managers_text: sec.managers_text || "" });
    };

    const cancelEditing = () => {
        setEditingSectionId(null);
    };

    const saveSectionChanges = async (id) => {
        try {
            const headers = { "Content-Type": "application/json", token: localStorage.token };
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/sections/${id}/info`, {
                method: "PUT", headers, body: JSON.stringify({ title: editFormData.title, room: editFormData.room, managers_text: editFormData.managers_text })
            });
            setEditingSectionId(null);
            loadData();
        } catch (err) { alert("Ошибка при сохранении"); }
    };

    // [ОБНОВЛЕНО] Функция назначения ДНЯ (вместо saveSchedule)
    // [ИСПРАВЛЕНО] Функция назначения ДАТЫ СЕКЦИИ
    const assignDay = async (id, date) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/sections/${id}/date`, {
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
            const response = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/role", {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ userId, roleId: newRoleId })
            });
            if (response.ok) loadData();
        } catch (err) { console.error(err); }
    };

    const handlePublish = async (id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/publish/${id}`, {
                method: "PUT", headers: { token: localStorage.token }
            });
            if (res.ok) {
                setReadyToPublish(prev => prev.map(item => item.id === id ? { ...item, status: 'published' } : item));
            }
        } catch (err) { console.error(err); }
    };

    const handleConfirmPayment = async (id) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}/payment`, {
                method: "PUT", headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ payment_status: 'paid' })
            });
            if (res.ok) {
                setReadyToPublish(prev => prev.map(item => item.id === id ? { ...item, payment_status: 'paid' } : item));
                alert("Оплата подтверждена");
            } else {
                alert("Ошибка подтверждения оплаты");
            }
        } catch (err) { console.error(err); }
    };

    const createNews = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/news", {
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
        if (!window.confirm("Удалить новость?")) return;
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/news/${id}`, {
                method: "DELETE", headers: { token: localStorage.token }
            });
            loadData();
        } catch (err) { console.error(err); }
    };

    // --- ФИЛЬТРАЦИЯ ---
    const filteredSchedule = scheduleFilter === "all" ? schedule : schedule.filter(item => item.section_name === scheduleFilter);
    const filteredPublishList = publishFilter === "all" ? readyToPublish : readyToPublish.filter(item => item.section_name === publishFilter);

    // --- ИКОНКИ (Lucide Style) ---
    const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
    const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
    const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
    const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
    const IconInfo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12, minWidth: '20px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
    const IconPrinter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;

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
    const labelStyle = { display: 'block', fontSize: '12px', color: '#495057', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Загрузка данных...</div>;

    return (
        <div style={containerStyle}>
            <div className="dashboard-header-row" style={headerRow}>
                <h3 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '600' }}>Панель Организатора</h3>
            </div>



            <div style={{ minHeight: '400px' }}>

                {/* 0. КОНФЕРЕНЦИИ */}
                {activeTab === 'conferences' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Управление конференциями</h2>
                            <button onClick={() => setShowConfForm(!showConfForm)} style={btnAction('primary')}>
                                <IconPlus /> {showConfForm ? 'Скрыть форму' : 'Создать'}
                            </button>
                        </div>

                        {showConfForm && (
                            <div style={{ ...formBoxStyle, marginBottom: '32px' }}>
                                <h4 style={{ color: '#003366', margin: '0 0 16px 0', fontSize: '16px' }}>Создать новую конференцию</h4>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target;
                                    const body = {
                                        title: form.title.value,
                                        description: form.description.value,
                                        date_start: form.date_start.value,
                                        date_end: form.date_end.value,
                                        location: form.location.value,
                                        submission_deadline: form.submission_deadline.value || null,
                                        program_formation_date: form.program_formation_date.value || null
                                    };
                                    try {
                                        const res = await fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/organizer/conferences", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", token: localStorage.token },
                                            body: JSON.stringify(body)
                                        });
                                        if (res.ok) {
                                            alert("Конференция создана");
                                            form.reset();
                                            loadData();
                                        }
                                    } catch (err) { console.error(err); }
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Название конференции *</label>
                                            <input name="title" type="text" style={inputStyle} required />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Описание</label>
                                            <textarea name="description" style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Дата начала *</label>
                                            <input name="date_start" type="date" style={inputStyle} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Дата окончания *</label>
                                            <input name="date_end" type="date" style={inputStyle} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Место проведения</label>
                                            <input name="location" type="text" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Дедлайн подачи *</label>
                                            <input name="submission_deadline" type="date" style={inputStyle} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Дата формирования программы *</label>
                                            <input name="program_formation_date" type="date" style={inputStyle} required />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                            <button type="submit" style={btnAction('success')}><IconPlus /> Создать конференцию</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {conferences.length === 0 ? (
                            <div style={{ padding: '20px', background: '#f8f9fa', color: '#666', borderRadius: '8px', textAlign: 'center' }}>
                                Конференции пока не созданы.
                            </div>
                        ) : (
                            <>
                                <h4 style={{ color: '#003366', margin: '0 0 16px 0', fontSize: '18px' }}>Список конференций</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                    {conferences.map(conf => {
                                        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '—';
                                        return (
                                            <div key={conf.id} style={{
                                                background: '#fff', border: conf.is_active ? '2px solid #2e7d32' : '1px solid #e0e4e8',
                                                borderRadius: '8px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column',
                                                boxShadow: conf.is_active ? '0 4px 12px rgba(46,125,50,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                                {conf.is_active && (
                                                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#d1e7dd', color: '#0f5132', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                        Активна
                                                    </div>
                                                )}
                                                <button onClick={() => setEditingConference(conf)} style={{ position: 'absolute', top: '16px', right: conf.is_active ? '95px' : '16px', background: 'none', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>
                                                    Редактировать
                                                </button>
                                                <h3 style={{ margin: '0 0 12px', color: '#003366', fontSize: '18px', paddingRight: conf.is_active ? '150px' : '80px', lineHeight: '1.3' }}>{conf.title}</h3>

                                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <strong style={{ width: '80px', color: '#333' }}>Даты:</strong>
                                                        <span>{fmtDate(conf.date_start)} — {fmtDate(conf.date_end)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <strong style={{ width: '80px', color: '#333' }}>Место:</strong>
                                                        <span>{conf.location || 'Не указано'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <strong style={{ width: '80px', color: '#333' }}>Дедлайн:</strong>
                                                        <span>{fmtDate(conf.submission_deadline)}</span>
                                                    </div>
                                                    {conf.description && (
                                                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0', lineHeight: '1.4' }}>
                                                            {conf.description}
                                                        </div>
                                                    )}
                                                </div>

                                                {!conf.is_active && (
                                                    <button onClick={async () => {
                                                        if (window.confirm(`Активировать конференцию "${conf.title}"? Текущая активная будет деактивирована.`)) {
                                                            try {
                                                                await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/conferences/${conf.id}/activate`, {
                                                                    method: "PUT",
                                                                    headers: { token: localStorage.token }
                                                                });
                                                                loadData();
                                                                window.location.reload();
                                                            } catch (err) { console.error(err); }
                                                        }
                                                    }} style={{ ...btnAction('success'), width: '100%', margin: 0, padding: '10px' }}>
                                                        Сделать активной
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* EDIT CONFERENCE MODAL */}
                        {editingConference && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                    <h3 style={{ margin: '0 0 20px', color: '#003366', fontSize: '20px' }}>Редактирование конференции</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.target;
                                        const body = {
                                            title: form.title.value,
                                            description: form.description.value,
                                            date_start: form.date_start.value,
                                            date_end: form.date_end.value,
                                            location: form.location.value,
                                            submission_deadline: form.submission_deadline.value || null,
                                            program_formation_date: form.program_formation_date.value || null
                                        };
                                        try {
                                            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/conferences/${editingConference.id}`, {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json", token: localStorage.token },
                                                body: JSON.stringify(body)
                                            });
                                            if (res.ok) {
                                                alert("Конференция обновлена");
                                                setEditingConference(null);
                                                loadData();
                                            }
                                        } catch (err) { console.error(err); }
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Название конференции *</label>
                                                <input name="title" type="text" defaultValue={editingConference.title} style={inputStyle} required />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Описание</label>
                                                <textarea name="description" defaultValue={editingConference.description} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Дата начала *</label>
                                                <input name="date_start" type="date" defaultValue={editingConference.date_start ? new Date(editingConference.date_start).toISOString().split('T')[0] : ''} style={inputStyle} required />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Дата окончания *</label>
                                                <input name="date_end" type="date" defaultValue={editingConference.date_end ? new Date(editingConference.date_end).toISOString().split('T')[0] : ''} style={inputStyle} required />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Место проведения</label>
                                                <input name="location" type="text" defaultValue={editingConference.location} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Дедлайн подачи</label>
                                                <input name="submission_deadline" type="date" defaultValue={editingConference.submission_deadline ? new Date(editingConference.submission_deadline).toISOString().split('T')[0] : ''} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Дата формирования программы</label>
                                                <input name="program_formation_date" type="date" defaultValue={editingConference.program_formation_date ? new Date(editingConference.program_formation_date).toISOString().split('T')[0] : ''} style={inputStyle} />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                                <button type="button" onClick={() => setEditingConference(null)} style={{ padding: '10px 20px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
                                                <button type="submit" style={btnAction('success')}>Сохранить</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* 1. СЕКЦИИ */}
                {activeTab === 'sections' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Управление секциями</h2>
                            {activeConference && (
                                <button onClick={() => setShowSecForm(!showSecForm)} style={btnAction('primary')}>
                                    <IconPlus /> {showSecForm ? 'Скрыть форму' : 'Создать'}
                                </button>
                            )}
                        </div>

                        {!activeConference ? (
                            <div style={{ padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '20px' }}>
                                Внимание: В данный момент нет активной конференции. Создание новых секций недоступно.
                            </div>
                        ) : (
                            showSecForm && (
                                <div style={{ ...formBoxStyle, marginBottom: '32px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#003366' }}>Создать новую секцию</h4>
                                    <form onSubmit={createSection} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Название секции *</label>
                                            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Аудитория</label>
                                            <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} style={inputStyle} placeholder="Напр. 201" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Руководители секции</label>
                                            <input type="text" value={managersText} onChange={e => setManagersText(e.target.value)} style={inputStyle} placeholder="Иванов И.И., Петров П.П." />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                            <button type="submit" style={btnAction('success')}><IconPlus /> Создать секцию</button>
                                        </div>
                                    </form>
                                </div>
                            )
                        )}

                        <h4 style={{ color: '#003366', margin: '0 0 16px 0', fontSize: '18px' }}>Список секций ({sections.length})</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {sections.map(sec => (
                                <div key={sec.id} style={{
                                    background: '#fff', border: '1px solid #e0e4e8',
                                    borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    {editingSectionId === sec.id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>Название секции</label>
                                                <input style={inputStyle} value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Аудитория</label>
                                                <input style={inputStyle} value={editFormData.room} onChange={e => setEditFormData({ ...editFormData, room: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Руководители (ПК)</label>
                                                <input style={inputStyle} value={editFormData.managers_text} onChange={e => setEditFormData({ ...editFormData, managers_text: e.target.value })} placeholder="Иванов И.И., Петров П.П." />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                <button onClick={() => saveSectionChanges(sec.id)} style={{ ...btnAction('success'), flex: 1, margin: 0 }}><IconCheck /> Сохранить</button>
                                                <button onClick={cancelEditing} style={{ ...btnAction('outline'), flex: 1, margin: 0 }}><IconX /> Отмена</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 style={{ margin: '0 0 12px', color: '#003366', fontSize: '18px', lineHeight: '1.3' }}>{sec.title}</h3>
                                            <div style={{ fontSize: '13px', color: '#555', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <strong style={{ width: '100px', color: '#333' }}>Аудитория:</strong>
                                                    <span>{sec.room || 'Не указана'}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                    <strong style={{ width: '100px', color: '#333', flexShrink: 0 }}>Руководители:</strong>
                                                    <span>{sec.managers_text || 'Не назначены'}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => startEditing(sec)} style={{ ...btnAction('outline'), width: '100%', margin: 0 }}>
                                                <IconEdit /> Редактировать
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. ПОЛЬЗОВАТЕЛИ */}
                {activeTab === 'users' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Управление пользователями</h2>
                            <input
                                type="text"
                                placeholder="Поиск по имени, фамилии или email..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                style={{ ...inputStyle, width: '300px', margin: 0 }}
                            />
                        </div>
                        <div className="table-responsive-wrapper">
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Пользователь</th>
                                        <th style={thStyle}>Текущая роль</th>
                                        <th style={thStyle}>Управление правами</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => {
                                        const query = userSearchQuery.toLowerCase();
                                        return (u.full_name && u.full_name.toLowerCase().includes(query)) ||
                                            (u.email && u.email.toLowerCase().includes(query));
                                    }).map(u => (
                                        <tr key={u.id}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 'bold', color: '#333' }}>{u.full_name}</div>
                                                <div style={{ fontSize: '13px', color: '#666' }}>{u.email}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                                                    background: u.role_id === 2 ? '#ffeeba' : u.role_id === 5 ? '#d4edda' : u.role_id === 4 ? '#cce5ff' : '#e2e3e5',
                                                    color: u.role_id === 2 ? '#856404' : u.role_id === 5 ? '#155724' : u.role_id === 4 ? '#004085' : '#383d41'
                                                }}>
                                                    {u.role_id === 2 && "Администратор ПК"}
                                                    {u.role_id === 5 && "Программный комитет"}
                                                    {u.role_id === 4 && "Рецензент"}
                                                    {u.role_id === 3 && "Участник"}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                {u.role_id !== 2 && (
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <button onClick={() => changeRole(u.id, 5)} disabled={u.role_id === 5} style={{ ...btnAction('outline'), opacity: u.role_id === 5 ? 0.5 : 1 }}>
                                                            ПК
                                                        </button>
                                                        <button onClick={() => changeRole(u.id, 4)} disabled={u.role_id === 4} style={{ ...btnAction('outline'), opacity: u.role_id === 4 ? 0.5 : 1 }}>
                                                            Рецензент
                                                        </button>
                                                        <button onClick={() => changeRole(u.id, 3)} disabled={u.role_id === 3} style={{ ...btnAction('outline'), opacity: u.role_id === 3 ? 0.5 : 1 }}>
                                                            Участник
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. РАСПИСАНИЕ (УПРАВЛЕНИЕ ДАТАМИ СЕКЦИЙ) */}
                {activeTab === 'schedule' && (
                    <div>
                        <div style={infoBoxStyle}>
                            <IconInfo />
                            <div style={{ marginRight: 'auto', color: '#004085', fontSize: '14px', lineHeight: '1.4' }}>
                                <strong>График конференции.</strong> Назначьте дату проведения для каждой секции.
                                <br />Администраторы будут распределять доклады внутри этой даты.
                            </div>
                        </div>

                        {/* Если секций нет, покажем сообщение */}
                        {sections.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999', border: '2px dashed #eee' }}>
                                Секций пока нет. Создайте их на первой вкладке.
                            </div>
                        ) : (
                            <div className="table-responsive-wrapper">
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
                                                    <div style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>{sec.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#777' }}>Ауд. {sec.room || "—"}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    {sec.managers_text ? (
                                                        <span style={{ color: '#0056b3', fontWeight: '500', background: '#e7f5ff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                                            {sec.managers_text}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>Не назначен</span>
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
                                                        if (!d) return alert("Выберите дату!");
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
                            </div>
                        )}
                    </div>
                )}


                {/* 4. ОПУБЛИКОВАТЬ СБОРНИК */}
                {activeTab === 'publish' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Сборник конференции</h2>
                        </div>

                        <div style={{ ...infoBoxStyle, background: '#e8f5e9', border: '1px solid #c3e6cb' }}>
                            <IconInfo />
                            <div style={{ marginRight: 'auto', color: '#155724', fontSize: '14px', lineHeight: '1.4' }}>
                                <strong>Публикация сборника.</strong> Загрузите PDF-файл сборника трудов конференции. Сборник станет доступен для скачивания на публичной странице после наступления даты окончания конференции (даты публикации сборников).
                            </div>
                        </div>

                        {activeConference ? (
                            <div style={formBoxStyle}>
                                <h4 style={{ color: '#003366', margin: '0 0 16px 0', fontSize: '18px' }}>Загрузка файла сборника</h4>

                                {activeConference.proceedings_url && (
                                    <div style={{ marginBottom: '20px', padding: '15px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#333' }}>
                                            <IconCheck /> <span style={{ fontWeight: '500' }}>Сборник уже загружен</span>
                                        </div>
                                        <a href={`http://localhost:5000${activeConference.proceedings_url}`} target="_blank" rel="noopener noreferrer" style={{ ...btnAction('outline'), textDecoration: 'none' }}>
                                            <IconDownload /> Скачать текущий файл
                                        </a>
                                    </div>
                                )}

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fileInput = e.target.file;
                                    if (!fileInput.files[0]) {
                                        alert("Выберите файл!");
                                        return;
                                    }
                                    const formData = new FormData();
                                    formData.append("file", fileInput.files[0]);

                                    try {
                                        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/organizer/conferences/${activeConference.id}/proceedings`, {
                                            method: "POST",
                                            headers: { token: localStorage.token },
                                            body: formData
                                        });
                                        if (res.ok) {
                                            alert("Сборник успешно загружен!");
                                            fileInput.value = "";
                                            // Перезагрузка страницы чтобы обновить activeConference
                                            window.location.reload();
                                        } else {
                                            alert("Ошибка при загрузке сборника");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Ошибка сети");
                                    }
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <input type="file" name="file" accept="application/pdf" style={{ ...inputStyle, flex: 1 }} required />
                                        <button type="submit" style={btnAction('success')}><IconPlus /> Загрузить сборник</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div style={{ padding: '50px', textAlign: 'center', color: '#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px' }}>
                                Нет активной конференции.
                            </div>
                        )}
                    </div>
                )}

                {/* ПОДТВЕРЖДЕНИЕ ОПЛАТЫ */}
                {activeTab === 'payment_confirm' && (
                    <div>
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#003366' }}>Подтверждение оплаты</h4>

                        {(() => {
                            const awaitingPayment = readyToPublish.filter(s => s.status === 'accepted' && (!s.payment_status || s.payment_status === 'unpaid'));
                            const pendingVerification = readyToPublish.filter(s => s.status === 'accepted' && s.payment_status === 'pending_verification');
                            const confirmed = readyToPublish.filter(s => s.status === 'accepted' && s.payment_status === 'paid');

                            const cardStyle = {
                                background: '#fff', border: '1px solid #e0e4e8', borderRadius: '10px',
                                padding: '20px 24px', marginBottom: '12px', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            };

                            return (
                                <>
                                    {/* Сводка */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px'
                                    }}>
                                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#888' }}>{awaitingPayment.length}</div>
                                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Ожидает оплаты</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '20px', background: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef6c00' }}>{pendingVerification.length}</div>
                                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Автор подтвердил</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #a5d6a7' }}>
                                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2e7d32' }}>{confirmed.length}</div>
                                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Оплачено</div>
                                        </div>
                                    </div>

                                    {/* Автор подтвердил оплату */}
                                    {pendingVerification.length > 0 && (
                                        <div style={{ marginBottom: '28px' }}>
                                            <h5 style={{ color: '#ef6c00', fontSize: '17px', marginBottom: '12px', borderBottom: '2px solid #ef6c00', paddingBottom: '8px' }}>
                                                Автор подтвердил оплату ({pendingVerification.length})
                                            </h5>
                                            {pendingVerification.map(sub => (
                                                <div key={sub.id} style={{ ...cardStyle, borderLeft: '4px solid #ef6c00' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#333', fontSize: '15px', marginBottom: '4px' }}>{sub.title}</div>
                                                        <div style={{ fontSize: '13px', color: '#666' }}>{sub.author_name} | {sub.section_name}</div>
                                                        <div style={{ fontSize: '12px', color: '#856404', marginTop: '4px', fontWeight: '600' }}>Автор подтвердил оплату, ожидается подтверждение администратора</div>
                                                    </div>
                                                    <button
                                                        style={{ ...btnAction('success'), padding: '10px 20px', fontSize: '14px' }}
                                                        onClick={() => handleConfirmPayment(sub.id)}
                                                    >
                                                        <IconCheck /> Доклад оплачен
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Ожидает оплаты */}
                                    {awaitingPayment.length > 0 && (
                                        <div style={{ marginBottom: '28px' }}>
                                            <h5 style={{ color: '#888', fontSize: '17px', marginBottom: '12px', borderBottom: '2px solid #ccc', paddingBottom: '8px' }}>
                                                Ожидает оплаты от автора ({awaitingPayment.length})
                                            </h5>
                                            {awaitingPayment.map(sub => (
                                                <div key={sub.id} style={{ ...cardStyle, borderLeft: '4px solid #ccc' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#333', fontSize: '15px', marginBottom: '4px' }}>{sub.title}</div>
                                                        <div style={{ fontSize: '13px', color: '#666' }}>{sub.author_name} | {sub.section_name}</div>
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: '#888', fontWeight: '600', padding: '6px 14px', background: '#f1f3f5', borderRadius: '12px' }}>Ожидает оплаты</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Оплачено */}
                                    {confirmed.length > 0 && (
                                        <div style={{ marginBottom: '28px' }}>
                                            <h5 style={{ color: '#2e7d32', fontSize: '17px', marginBottom: '12px', borderBottom: '2px solid #2e7d32', paddingBottom: '8px' }}>
                                                Оплачено ({confirmed.length})
                                            </h5>
                                            {confirmed.map(sub => (
                                                <div key={sub.id} style={{ ...cardStyle, borderLeft: '4px solid #2e7d32' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#333', fontSize: '15px', marginBottom: '4px' }}>{sub.title}</div>
                                                        <div style={{ fontSize: '13px', color: '#666' }}>{sub.author_name} | {sub.section_name}</div>
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: '#2e7d32', fontWeight: '700', padding: '6px 14px', background: '#e8f5e9', borderRadius: '12px', border: '1px solid #a5d6a7' }}>Оплачено</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {awaitingPayment.length === 0 && pendingVerification.length === 0 && confirmed.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '50px', color: '#888', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                            Нет принятых докладов для подтверждения оплаты
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* 5. НОВОСТИ */}
                {activeTab === 'news' && (
                    <div>
                        <div style={formBoxStyle}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#003366' }}>Добавить новость</h4>
                            <form onSubmit={createNews}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={labelStyle}>Заголовок</label>
                                    <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} style={inputStyle} required />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Текст новости</label>
                                    <textarea rows="4" value={newsContent} onChange={e => setNewsContent(e.target.value)} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} required />
                                </div>
                                <button type="submit" style={btnAction('success')}><IconPlus /> Опубликовать</button>
                            </form>
                        </div>

                        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Список новостей ({newsList.length})</h4>
                        {newsList.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px' }}>Новостей пока нет.</div>
                        ) : (
                            <div className="table-responsive-wrapper">
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
                                                    <strong style={{ color: '#333', fontSize: '15px' }}>{n.title}</strong>
                                                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{n.content.slice(0, 100)}...</p>
                                                </td>
                                                <td style={tdStyle} width="120">
                                                    <button onClick={() => deleteNews(n.id)} style={btnAction('danger')}><IconTrash /> Удалить</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. СТАТИСТИКА */}
                {activeTab === 'statistics' && (
                    <div className="print-area">
                        <div style={{ ...infoBoxStyle, justifyContent: 'space-between' }} className="no-print">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IconInfo />
                                <div style={{ color: '#004085', fontSize: '14px', lineHeight: '1.4' }}>
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
                                                <span style={{ color: '#555' }}>{u.role_id === 2 ? 'Администраторы ПК' : u.role_id === 5 ? 'Программный комитет' : u.role_id === 4 ? 'Рецензенты' : 'Участники'}</span>
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
                                        {statistics.submissions.length === 0 ? <li style={{ color: '#999', padding: '10px 0' }}>Нет поданных докладов</li> : null}
                                        {statistics.submissions.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <span style={{ color: '#555' }}>
                                                    {s.status === 'accepted' ? 'Приняты' : s.status === 'published' ? 'Опубликованы' : s.status === 'rejected' ? 'Отклонены' : 'На проверке'}
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
                                        {statistics.sections.length === 0 ? <li style={{ color: '#999', padding: '10px 0' }}>Нет активных секций</li> : null}
                                        {statistics.sections.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <span style={{ color: '#555', wordBreak: 'break-word', paddingRight: '15px' }}>{s.title}</span>
                                                <strong style={{ color: '#333' }}>{s.count}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Блок: Нагрузка на рецензентов */}
                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#003366', borderBottom: '2px solid #f1f3f5', paddingBottom: '10px' }}>Нагрузка рецензентов</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
                                        {(!statistics.reviewerLoad || statistics.reviewerLoad.length === 0) ? <li style={{ color: '#999', padding: '10px 0' }}>Рецензенты не найдены</li> : null}
                                        {statistics.reviewerLoad && statistics.reviewerLoad.map((rl, i) => (
                                            <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f8f9fa' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '600', color: '#003366' }}>{rl.reviewer_name}</span>
                                                    <span style={{ color: '#555' }}>Назначено: {rl.total_assigned || 0}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                    <span style={{ color: '#28a745', fontWeight: '600' }}>
                                                        Завершено: {rl.completed || 0}
                                                    </span>
                                                    <span style={{ color: parseInt(rl.pending) > 0 ? '#dc3545' : '#888', fontWeight: parseInt(rl.pending) > 0 ? '600' : 'normal' }}>
                                                        Ожидают: {rl.pending || 0}
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
                                        <div style={{ color: '#999', padding: '10px 0' }}>Нет данных по датам</div>
                                    ) : (
                                        <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={statistics.timeline}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={(tick) => new Date(tick).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: '#666' }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        allowDecimals={false}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12, fill: '#666' }}
                                                    />
                                                    <Tooltip
                                                        labelFormatter={(label) => new Date(label).toLocaleDateString('ru-RU')}
                                                        formatter={(value) => [value, 'Заявок']}
                                                        cursor={{ fill: '#f8f9fa' }}
                                                    />
                                                    <Bar dataKey="count" fill="#228be6" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
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
