import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ConferenceInfoBlock from '../components/ConferenceInfoBlock';

const API = 'http://localhost:5000/api';

const ProgramCommitteeDashboard = ({ activeTab, activeConference, roleId }) => {
    const { t, language } = useLanguage();

    // --- Данные рецензирования ---
    const [submissions, setSubmissions] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedReviewer, setSelectedReviewer] = useState({});
    const [historyData, setHistoryData] = useState(null);
    const [showHistoryFor, setShowHistoryFor] = useState(null);
    const [subSearchQuery, setSubSearchQuery] = useState('');
    const [subStatusFilter, setSubStatusFilter] = useState('all');
    const [reviewSearchQuery, setReviewSearchQuery] = useState('');
    const [reviewStatusFilter, setReviewStatusFilter] = useState('all');

    // --- Данные секции (заявки + расписание) ---
    const [mySections, setMySections] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [appFilterId, setAppFilterId] = useState('all');
    const [scheduleFilterId, setScheduleFilterId] = useState('');

    const headers = { token: localStorage.token };

    // --- Рецензирование: fetch ---
    const fetchSubmissions = async () => {
        try {
            const res = await fetch(`${API}/pc/submissions`, { headers });
            if (res.ok) setSubmissions(await res.json());
        } catch (err) { console.error(err); }
    };
    const fetchReviewers = async () => {
        try {
            const res = await fetch(`${API}/pc/reviewers`, { headers });
            if (res.ok) setReviewers(await res.json());
        } catch (err) { console.error(err); }
    };
    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API}/pc/reviews`, { headers });
            if (res.ok) setReviews(await res.json());
        } catch (err) { console.error(err); }
    };
    const fetchStats = async () => {
        try {
            const res = await fetch(`${API}/pc/statistics`, { headers });
            if (res.ok) setStats(await res.json());
        } catch (err) { console.error(err); }
    };

    // --- Секция: fetch ---
    const fetchAdminData = async () => {
        try {
            const res = await fetch(`${API}/admin/dashboard`, { headers });
            if (res.ok) {
                const data = await res.json();
                const loadedSections = data.sections || [];
                setMySections(loadedSections);
                setMySubmissions(data.submissions || []);
                if (loadedSections.length > 0 && !scheduleFilterId) {
                    setScheduleFilterId(loadedSections[0].id.toString());
                }
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchSubmissions(), fetchReviewers(), fetchReviews(), fetchStats(), fetchAdminData()]);
            setLoading(false);
        };
        load();
    }, []);

    // --- Рецензирование: действия ---
    const assignReviewer = async (submissionId) => {
        const reviewerId = selectedReviewer[submissionId];
        if (!reviewerId) return;
        try {
            const res = await fetch(`${API}/pc/assign`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_id: submissionId, reviewer_id: reviewerId })
            });
            const data = await res.json();
            setMessage(typeof data === 'string' ? data : 'Рецензент назначен');
            fetchSubmissions();
            fetchReviewers();
        } catch (err) { console.error(err); }
    };

    const forwardToAuthor = async (submissionId, reviewId) => {
        try {
            const res = await fetch(`${API}/pc/forward/${submissionId}`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id: reviewId })
            });
            const data = await res.json();
            setMessage(typeof data === 'string' ? data : (data.message || 'Рецензия отправлена автору'));
            fetchSubmissions();
            fetchReviews();
        } catch (err) { console.error(err); }
    };

    const forwardToReviewer = async (submissionId) => {
        try {
            const res = await fetch(`${API}/pc/forward-to-reviewer/${submissionId}`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Доклад отправлен рецензенту на повторную проверку');
            } else {
                setMessage(typeof data === 'string' ? data : data.message || 'Ошибка');
            }
            fetchSubmissions();
            fetchReviews();
        } catch (err) { console.error(err); }
    };

    const sendReminders = async () => {
        try {
            const res = await fetch(`${API}/pc/reminders`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setMessage(data.message || 'Напоминалки отправлены');
        } catch (err) { console.error(err); }
    };

    const loadHistory = async (subId) => {
        try {
            const res = await fetch(`${API}/pc/history/${subId}`, { headers });
            if (res.ok) {
                setHistoryData(await res.json());
                setShowHistoryFor(subId);
            }
        } catch (err) { console.error(err); }
    };

    // --- Секция: действия ---
    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API}/admin/submissions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setMySubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
            }
        } catch (err) { console.error(err); }
    };

    const saveSchedule = async (id, fullDateTime, duration) => {
        try {
            const response = await fetch(`${API}/admin/schedule/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ start_time: fullDateTime, duration: parseInt(duration) })
            });
            if (response.ok) {
                alert("Расписание обновлено");
                fetchAdminData();
            } else {
                const msg = await response.json();
                alert(`Ошибка: ${msg}`);
            }
        } catch (err) { alert("Ошибка сети"); }
    };

    const handleDownload = async (fileUrl) => {
        try {
            const filename = fileUrl.split('/').pop();
            const res = await fetch(`${API}/submissions/download/${filename}`, { headers });
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

    // --- Фильтрация ---
    const applicationsData = appFilterId === 'all'
        ? mySubmissions
        : mySubmissions.filter(s => s.section_id === parseInt(appFilterId));

    const scheduleData = mySubmissions
        .filter(s => s.section_id === parseInt(scheduleFilterId) && s.status === 'accepted')
        .sort((a, b) => {
            if (!a.start_time && !b.start_time) return 0;
            if (!a.start_time) return 1;
            if (!b.start_time) return -1;
            return new Date(a.start_time) - new Date(b.start_time);
        });

    // --- Стили ---
    const cardStyle = {
        background: '#fff', border: '1px solid #ced4da', borderRadius: '2px',
        padding: '24px', marginBottom: '16px'
    };
    const btnPrimary = {
        background: '#003366', color: '#fff',
        border: 'none', borderRadius: '2px', padding: '10px 20px', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase'
    };
    const btnWarning = { ...btnPrimary, background: '#ef6c00' };
    const btnOutline = {
        background: 'transparent', color: '#003366', border: '1px solid #003366',
        borderRadius: '2px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase'
    };
    const badgeStyle = (color) => ({
        display: 'inline-block', padding: '4px 12px', borderRadius: '2px',
        fontSize: '11px', fontWeight: 'bold', background: color + '15', color: color, border: `1px solid ${color}33`, textTransform: 'uppercase'
    });
    const statCardStyle = {
        background: '#fff', border: '1px solid #ced4da', borderRadius: '2px',
        padding: '24px', textAlign: 'center'
    };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff', border: '1px solid #dee2e6' };
    const thStyle = { background: '#e9ecef', padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#343a40', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #dee2e6', verticalAlign: 'middle', color: '#212529' };
    const inputStyle = { padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '2px', fontSize: '14px', width: '100%', outline: 'none' };
    const infoBoxStyle = { marginBottom: '20px', display: 'flex', alignItems: 'center', background: '#e8f4fd', padding: '16px', borderRadius: '2px', border: '1px solid #b6d4fe' };

    const btnAction = (type) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 16px', border: type === 'outline' ? '1px solid #003366' : '1px solid transparent', borderRadius: '2px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase',
        background: type === 'accept' ? '#198754' : type === 'save' || type === 'primary' ? '#003366' : type === 'outline' ? 'transparent' : '#dc3545',
        color: type === 'outline' ? '#003366' : 'white', marginRight: '8px', transition: 'opacity 0.2s'
    });
    const adminBadgeStyle = (type) => ({
        padding: '5px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block',
        background: type === 'pending' ? '#fff3cd' : type === 'accepted' ? '#d1e7dd' : type === 'published' ? '#e2e3e5' : '#f8d7da',
        color: type === 'pending' ? '#856404' : type === 'accepted' ? '#0f5132' : type === 'published' ? '#383d41' : '#842029',
        border: `1px solid ${type === 'pending' ? '#ffeeba' : type === 'accepted' ? '#badbcc' : type === 'published' ? '#d6d8db' : '#f5c6cb'}`
    });

    const statusColors = {
        pending: '#ff9800', revision_submitted: '#0277bd', under_review: '#1565c0', reviewed: '#0288d1', revision_requested: '#ef6c00',
        accepted: '#4caf50', rejected: '#e53935', final_rejected: '#b71c1c', published: '#9c27b0'
    };
    const statusLabels = {
        pending: 'На рассмотрении', revision_submitted: 'Исправлено автором', under_review: 'На рецензии', reviewed: 'Оценено', revision_requested: 'Требует доработки',
        accepted: 'Принят', rejected: 'Отклонён', final_rejected: 'Окончательно отклонён', published: 'Опубликован'
    };

    const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
    const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
    const IconInfo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12, minWidth: '20px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Загрузка...</div>;

    // ===== ЗАЯВКИ НА СЕКЦИЮ =====
    if (activeTab === 'applications') {
        return (
            <div>

                <h2 style={{ color: '#003366', marginBottom: '20px', fontSize: '22px' }}>Заявки на секцию</h2>

                {mySections.length === 0 ? (
                    <div style={{ ...cardStyle, textAlign: 'center', color: '#888' }}>Вам не назначены секции.</div>
                ) : (
                    <>
                        <div style={infoBoxStyle}>
                            <IconInfo />
                            <div style={{ marginRight: 'auto', color: '#004085', fontSize: '14px', lineHeight: '1.4' }}>
                                <strong>Модерация заявок.</strong> Одобренные доклады попадут в список для составления расписания.
                            </div>
                            <select
                                value={appFilterId}
                                onChange={e => setAppFilterId(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '4px', minWidth: '220px', border: '1px solid #b6d4fe', color: '#004085', fontWeight: '500', cursor: 'pointer' }}
                            >
                                <option value="all">Все мои секции</option>
                                {mySections.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                            </select>
                        </div>

                        {applicationsData.length === 0 ? (
                            <div style={{ padding: '50px', textAlign: 'center', color: '#adb5bd', border: '2px dashed #dee2e6', borderRadius: '6px' }}>
                                Заявок не найдено.
                            </div>
                        ) : (
                            <div className="table-responsive-wrapper">
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
                                                    <div style={{ fontWeight: '700', color: '#003366', marginBottom: '6px', fontSize: '15px' }}>{sub.title}</div>
                                                    <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>{(sub.abstract || "").slice(0, 100)}...</div>
                                                    {sub.file_url && (
                                                        <button onClick={() => handleDownload(sub.file_url)} style={{ ...btnAction('save'), background: 'transparent', color: '#0056b3', border: '1px solid #0056b3', marginTop: '12px', padding: '6px 12px' }}>
                                                            <IconDownload /> Скачать материал
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '600', color: '#333' }}>{sub.speaker_name}</div>
                                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{sub.email}</div>
                                                    <div style={{ fontSize: '12px', color: '#0056b3', fontWeight: '600', background: '#e7f5ff', display: 'inline-block', padding: '2px 6px', borderRadius: '4px' }}>{sub.section_name}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={adminBadgeStyle(sub.status)}>
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
                                                        <span style={{ fontSize: '13px', color: '#868e96', fontStyle: 'italic' }}>Решение принято</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    // ===== РАСПИСАНИЕ СЕКЦИИ =====
    // ===== ПРОГРАММА КОНФЕРЕНЦИИ =====
    if (activeTab === 'pc_program') {
        // Оплаченные — попадают в программу
        const programData = mySubmissions
            .filter(s => s.status === 'accepted' && s.payment_status === 'paid')
            .sort((a, b) => {
                if (!a.start_time && !b.start_time) return 0;
                if (!a.start_time) return 1;
                if (!b.start_time) return -1;
                return new Date(a.start_time) - new Date(b.start_time);
            });

        const canPublish = activeConference && activeConference.program_formation_date
            ? new Date().setHours(0, 0, 0, 0) >= new Date(activeConference.program_formation_date).setHours(0, 0, 0, 0)
            : false;

        // Группировка по секциям (section_id)
        const sectionGroups = {};
        programData.forEach(sub => {
            const key = sub.section_id;
            if (!sectionGroups[key]) {
                sectionGroups[key] = {
                    name: sub.section_name,
                    section_id: sub.section_id,
                    scheduled_day: sub.scheduled_day,
                    submissions: []
                };
            }
            sectionGroups[key].submissions.push(sub);
        });

        const saveSectionDate = async (sectionId, dateValue) => {
            try {
                const res = await fetch(`${API}/organizer/sections/${sectionId}/date`, {
                    method: 'PUT',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section_date: dateValue })
                });
                if (res.ok) {
                    setMessage('Дата секции сохранена');
                    fetchAdminData();
                }
            } catch (err) { console.error(err); }
        };

        return (
            <div>
                <h2 style={{ color: '#003366', marginBottom: '24px', fontSize: '22px' }}>Программа конференции</h2>

                {message && <div style={{ padding: '12px 20px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', marginBottom: '16px', color: '#2e7d32' }}>{message}</div>}

                {/* Информация о дате публикации */}
                {activeConference && activeConference.program_formation_date && (
                    <div style={infoBoxStyle}>
                        <IconInfo />
                        <div style={{ color: '#004085', fontSize: '14px', lineHeight: '1.5' }}>
                            <strong>Дата публикации программы:</strong> {new Date(activeConference.program_formation_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {canPublish
                                ? <span style={{ color: '#2e7d32', fontWeight: '600', marginLeft: '12px' }}>Публикация доступна</span>
                                : <span style={{ color: '#c62828', fontWeight: '600', marginLeft: '12px' }}>Публикация пока недоступна</span>
                            }
                        </div>
                    </div>
                )}

                {/* Оплаченные доклады — программа */}
                {programData.length === 0 ? (
                    <div style={{ ...cardStyle, textAlign: 'center', color: '#888', padding: '50px' }}>
                        <p style={{ fontSize: '16px', marginBottom: '8px' }}>Нет оплаченных докладов для формирования программы</p>
                        <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Доклады появятся после подтверждения оплаты администратором ПК</p>
                    </div>
                ) : (
                    <>
                        <h3 style={{ color: '#2e7d32', fontSize: '18px', marginBottom: '16px', borderBottom: '2px solid #2e7d32', paddingBottom: '8px' }}>
                            Оплаченные доклады в программе ({programData.length})
                        </h3>

                        {Object.values(sectionGroups).map(section => {
                            const currentDate = section.scheduled_day
                                ? new Date(section.scheduled_day).toISOString().split('T')[0]
                                : '';

                            return (
                                <div key={section.section_id} style={{ marginBottom: '28px', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                                    {/* Заголовок секции с date picker */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: '#e3f2fd', padding: '14px 20px', borderBottom: '1px solid #dee2e6'
                                    }}>
                                        <h4 style={{ color: '#003366', fontSize: '16px', margin: 0, fontWeight: '700' }}>
                                            {section.name} ({section.submissions.length})
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>Дата секции:</label>
                                            <input
                                                type="date"
                                                id={`secdate-${section.section_id}`}
                                                defaultValue={currentDate}
                                                style={{ ...inputStyle, maxWidth: '170px', padding: '6px 10px' }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const val = document.getElementById(`secdate-${section.section_id}`).value;
                                                    if (!val) return alert('Выберите дату!');
                                                    saveSectionDate(section.section_id, val);
                                                }}
                                                style={{ ...btnAction('save'), fontSize: '12px', padding: '6px 14px' }}
                                            >
                                                <IconCheck /> Сохранить дату
                                            </button>
                                        </div>
                                    </div>

                                    {/* Таблица докладов */}
                                    <div className="table-responsive-wrapper">
                                        <table style={{ ...tableStyle, marginBottom: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={thStyle}>Доклад</th>
                                                    <th style={thStyle}>Докладчик</th>
                                                    <th style={thStyle}>Время</th>
                                                    <th style={thStyle}>Длит. (мин)</th>
                                                    <th style={thStyle}>Действие</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {section.submissions.map(sub => {
                                                    let displayTime = "";
                                                    if (sub.start_time) {
                                                        const dateObj = new Date(sub.start_time);
                                                        displayTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
                                                    }

                                                    return (
                                                        <tr key={sub.id}>
                                                            <td style={tdStyle}><div style={{ fontWeight: '600', color: '#333', maxWidth: '300px' }}>{sub.title}</div></td>
                                                            <td style={tdStyle}><span style={{ color: '#555', fontSize: '13px' }}>{sub.speaker_name}</span></td>
                                                            <td style={tdStyle}>
                                                                <input
                                                                    key={`ptime-${sub.id}-${displayTime}`}
                                                                    type="time"
                                                                    id={`ptime-${sub.id}`}
                                                                    defaultValue={displayTime}
                                                                    style={{ ...inputStyle, maxWidth: '120px' }}
                                                                />
                                                            </td>
                                                            <td style={tdStyle}>
                                                                <input
                                                                    key={`pdur-${sub.id}-${sub.duration}`}
                                                                    type="number"
                                                                    id={`pdur-${sub.id}`}
                                                                    defaultValue={sub.duration || 15}
                                                                    min="5"
                                                                    style={{ ...inputStyle, maxWidth: '80px' }}
                                                                />
                                                            </td>
                                                            <td style={tdStyle}>
                                                                <button
                                                                    onClick={() => {
                                                                        const timeVal = document.getElementById(`ptime-${sub.id}`).value;
                                                                        const durVal = document.getElementById(`pdur-${sub.id}`).value;
                                                                        if (!section.scheduled_day) return alert("Сначала назначьте дату для секции!");
                                                                        if (!timeVal) return alert("Выберите время!");
                                                                        const datePart = new Date(section.scheduled_day).toISOString().split('T')[0];
                                                                        saveSchedule(sub.id, `${datePart}T${timeVal}:00`, durVal);
                                                                    }}
                                                                    style={{ ...btnAction('save'), fontSize: '12px' }}
                                                                >
                                                                    <IconCheck /> Сохранить
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {!section.scheduled_day && (
                                        <div style={{ padding: '10px 20px', background: '#fff3cd', borderTop: '1px solid #ffc107', fontSize: '13px', color: '#856404' }}>
                                            ⚠ Назначьте дату секции, чтобы сохранять время докладов
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}

                {/* Сводка */}
                {programData.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '30px', padding: '24px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                        {canPublish ? (
                            <p style={{ color: '#2e7d32', fontSize: '14px', marginBottom: '16px' }}>
                                Программа опубликована на странице "Программа конференции" для всех посетителей сайта.
                            </p>
                        ) : activeConference && activeConference.program_formation_date ? (
                            <p style={{ color: '#c62828', fontSize: '14px', marginBottom: '16px' }}>
                                Публикация программы станет доступна {new Date(activeConference.program_formation_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}. Пока что вы можете формировать расписание.
                            </p>
                        ) : (
                            <p style={{ color: '#856404', fontSize: '14px', marginBottom: '16px' }}>
                                Дата формирования программы не указана. Установите её в настройках конференции.
                            </p>
                        )}
                        <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>
                            Докладов с назначенным временем: {programData.filter(s => s.start_time).length} из {programData.length}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // ===== СТАТИСТИКА =====
    if (activeTab === 'pc_stats') {
        return (
            <div>

                <h2 style={{ color: '#003366', marginBottom: '24px', fontSize: '22px' }}> Статистика</h2>

                {stats && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                            <div style={statCardStyle}>
                                <div style={{ fontSize: '36px', fontWeight: '700', color: '#003366' }}>{stats.total}</div>
                                <div style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>Всего докладов</div>
                            </div>
                            {stats.by_status.map((s, i) => (
                                <div key={i} style={statCardStyle}>
                                    <div style={{ fontSize: '36px', fontWeight: '700', color: statusColors[s.status] || '#333' }}>{s.count}</div>
                                    <div style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>{statusLabels[s.status] || s.status}</div>
                                </div>
                            ))}
                        </div>

                        <h3 style={{ color: '#003366', marginBottom: '16px' }}>Нагрузка рецензентов</h3>
                        {stats.reviewer_load.map((r, i) => (
                            <div key={i} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: '#003366' }}>{r.reviewer_name}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <span style={{ color: '#888', fontSize: '14px' }}>Назначено: <strong>{r.total_assigned}</strong></span>
                                    <span style={{ color: '#4caf50', fontSize: '14px' }}>Завершено: <strong>{r.completed}</strong></span>
                                    <span style={{ color: '#ef6c00', fontSize: '14px' }}>В работе: <strong>{r.pending}</strong></span>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    }

    // ===== РЕЦЕНЗИИ =====
    if (activeTab === 'pc_reviews') {
        const filteredReviews = reviews.filter(r => {
            const query = reviewSearchQuery.toLowerCase();
            const matchesSearch = (r.submission_title && r.submission_title.toLowerCase().includes(query)) ||
                (r.author_name && r.author_name.toLowerCase().includes(query)) ||
                (r.reviewer_name && r.reviewer_name.toLowerCase().includes(query));
            const matchesStatus = reviewStatusFilter === 'all' || r.decision === reviewStatusFilter;
            return matchesSearch && matchesStatus;
        });

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Все рецензии</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Поиск по докладу, автору или рецензенту..."
                            value={reviewSearchQuery}
                            onChange={(e) => setReviewSearchQuery(e.target.value)}
                            style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', width: '320px', outline: 'none' }}
                        />
                        <select
                            value={reviewStatusFilter}
                            onChange={(e) => setReviewStatusFilter(e.target.value)}
                            style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
                        >
                            <option value="all">Все решения</option>
                            <option value="accepted">Приняты</option>
                            <option value="rejected">Отклонены</option>
                        </select>
                    </div>
                </div>

                {filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#888', padding: '40px', border: '1px solid #dee2e6', background: '#fff' }}>
                        Рецензии не найдены. Попробуйте изменить фильтры.
                    </div>
                ) : (
                    <div className="table-responsive-wrapper">
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Доклад / Версия</th>
                                    <th style={thStyle}>Автор / Рецензент</th>
                                    <th style={thStyle}>Решение / Отзыв</th>
                                    <th style={thStyle}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map((r, i) => (
                                    <tr key={i} style={{ borderLeft: `4px solid ${r.decision === 'accepted' ? '#4caf50' : '#e53935'}`, borderBottom: '1px solid #dee2e6' }}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 'bold', color: '#003366', marginBottom: '4px' }}>{r.submission_title}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Версия: {r.version_number}</div>
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{new Date(r.created_at).toLocaleDateString('ru-RU')}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ marginBottom: '4px' }}><strong style={{ color: '#333' }}>Автор:</strong> {r.author_name}</div>
                                            <div><strong style={{ color: '#333' }}>Рецензент:</strong> {r.reviewer_name}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ ...badgeStyle(r.decision === 'accepted' ? '#4caf50' : '#e53935'), marginBottom: '8px', display: 'inline-block' }}>
                                                {r.decision === 'accepted' ? 'Принят' : 'Отклонён'}
                                            </span>
                                            {r.rejection_reason && (
                                                <div style={{ fontSize: '13px', color: '#c62828', marginTop: '4px' }}>
                                                    <strong>Причина:</strong> {r.rejection_reason}
                                                </div>
                                            )}
                                            {r.comment && (
                                                <div style={{ fontSize: '13px', color: '#555', fontStyle: 'italic', marginTop: '4px' }}>
                                                    <strong>Отзыв:</strong> {r.comment}
                                                </div>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            {r.submission_status === 'reviewed' && r.version_number === r.submission_current_version ? (
                                                <button
                                                    style={{ ...(r.decision === 'accepted' ? btnAction('accept') : btnWarning), fontSize: '12px', padding: '8px 12px', margin: 0, width: '100%' }}
                                                    onClick={() => forwardToAuthor(r.submission_id, r.id)}
                                                >
                                                    {r.decision === 'accepted' ? 'Утвердить' : 'На исправление'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#888' }}>Нет действий</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // ===== ДОКЛАДЫ (default — pc_submissions) =====
    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = (sub.title && sub.title.toLowerCase().includes(subSearchQuery.toLowerCase())) ||
            (sub.author_name && sub.author_name.toLowerCase().includes(subSearchQuery.toLowerCase()));
        const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Управление докладами</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Поиск по названию или автору..."
                        value={subSearchQuery}
                        onChange={(e) => setSubSearchQuery(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', width: '280px', outline: 'none' }}
                    />
                    <select
                        value={subStatusFilter}
                        onChange={(e) => setSubStatusFilter(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
                    >
                        <option value="all">Все статусы</option>
                        <option value="pending">Ожидают рецензента</option>
                        <option value="assigned">На рецензии</option>
                        <option value="reviewed">Проверены (ПК)</option>
                        <option value="accepted">Приняты</option>
                        <option value="revision_requested">На доработке</option>
                        <option value="final_rejected">Отклонены</option>
                    </select>
                    <button style={{ ...btnWarning, padding: '8px 16px', fontSize: '14px', margin: 0 }} onClick={sendReminders}>
                        Отправить напоминания
                    </button>
                </div>
            </div>

            {message && (
                <div style={{ padding: '12px 20px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', marginBottom: '24px', color: '#2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#2e7d32' }}>&times;</button>
                </div>
            )}

            {filteredSubmissions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', padding: '40px', border: '1px solid #dee2e6', background: '#fff' }}>
                    Доклады не найдены. Попробуйте изменить фильтры.
                </div>
            ) : (
                <div className="table-responsive-wrapper">
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Доклад</th>
                                <th style={thStyle}>Автор / Секция</th>
                                <th style={thStyle}>Статус / Рецензент</th>
                                <th style={thStyle}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.map(sub => (
                                <React.Fragment key={sub.id}>
                                    <tr style={{ borderLeft: `4px solid ${statusColors[sub.status] || '#ccc'}`, borderBottom: '1px solid #dee2e6' }}>
                                        <td style={tdStyle} width="35%">
                                            <div style={{ fontWeight: 'bold', color: '#003366', marginBottom: '4px' }}>{sub.title}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Версия: {sub.current_version || 1}</div>
                                            {sub.rejection_count > 0 && (
                                                <div style={{ fontSize: '12px', color: '#c62828', marginTop: '4px' }}>Отказов: {sub.rejection_count}/3</div>
                                            )}
                                        </td>
                                        <td style={tdStyle} width="20%">
                                            <div style={{ marginBottom: '4px' }}><strong style={{ color: '#333' }}>Автор:</strong> {sub.author_name}</div>
                                            <div><strong style={{ color: '#333' }}>Секция:</strong> {sub.section_name}</div>
                                        </td>
                                        <td style={tdStyle} width="20%">
                                            <div style={{ marginBottom: '8px' }}>
                                                <span style={{ ...badgeStyle(statusColors[sub.status] || '#666'), fontSize: '12px', padding: '4px 8px' }}>
                                                    {statusLabels[sub.status] || sub.status}
                                                </span>
                                            </div>
                                            {sub.status === 'pending' && !sub.reviewer_name ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <select
                                                        value={selectedReviewer[sub.id] || ''}
                                                        onChange={(e) => setSelectedReviewer({ ...selectedReviewer, [sub.id]: e.target.value })}
                                                        style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '2px', fontSize: '12px', outline: 'none' }}
                                                    >
                                                        <option value="">Рецензент...</option>
                                                        {reviewers.map(r => (
                                                            <option key={r.id} value={r.id}>{r.first_name} {r.last_name} ({r.assigned_count})</option>
                                                        ))}
                                                    </select>
                                                    <button style={{ ...btnAction('success'), fontSize: '11px', padding: '4px 8px', margin: 0 }} onClick={() => assignReviewer(sub.id)}>Назначить</button>
                                                </div>
                                            ) : sub.status === 'revision_submitted' && sub.reviewer_name ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '12px' }}>
                                                        <strong style={{ color: '#333' }}>Рецензент:</strong> {sub.reviewer_name}
                                                    </div>
                                                    <button style={{ ...btnAction('primary'), fontSize: '11px', padding: '4px 8px', margin: 0, marginTop: '4px' }} onClick={() => forwardToReviewer(sub.id)}>
                                                        Отправить рецензенту
                                                    </button>
                                                </div>
                                            ) : sub.reviewer_name ? (
                                                <div style={{ fontSize: '12px' }}>
                                                    <strong style={{ color: '#333' }}>Рецензент:</strong> {sub.reviewer_name}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td style={tdStyle} width="25%">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {sub.file_url && (
                                                    <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer"
                                                        style={{ ...btnAction('primary'), textDecoration: 'none', fontSize: '12px', padding: '6px 12px', margin: 0, textAlign: 'center' }}>
                                                        Скачать файл
                                                    </a>
                                                )}
                                                <button style={{ ...btnAction('outline'), fontSize: '12px', padding: '6px 12px', margin: 0 }} onClick={() => loadHistory(sub.id)}>
                                                    История версий
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {showHistoryFor === sub.id && historyData && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '16px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                                <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: '2px', padding: '16px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                        <h4 style={{ margin: 0, color: '#003366', fontSize: '16px' }}>История версий</h4>
                                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#888' }} onClick={() => setShowHistoryFor(null)}>&times;</button>
                                                    </div>
                                                    {historyData.versions.length === 0 ? (
                                                        <p style={{ color: '#888', textAlign: 'center', margin: '10px 0' }}>Нет сохранённых версий</p>
                                                    ) : (
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ ...thStyle, padding: '8px' }}>Версия / Дата</th>
                                                                    <th style={{ ...thStyle, padding: '8px' }}>Решение</th>
                                                                    <th style={{ ...thStyle, padding: '8px' }}>Файл</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {historyData.versions.map((v, i) => (
                                                                    <tr key={i} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                                        <td style={{ padding: '8px' }}>
                                                                            <strong>Версия {v.version_number}</strong> {v.is_current && <span style={{ ...badgeStyle('#4caf50'), fontSize: '10px', padding: '2px 6px', marginLeft: '4px' }}>Текущая</span>}<br />
                                                                            <span style={{ color: '#666', fontSize: '12px' }}>{new Date(v.uploaded_at).toLocaleDateString('ru-RU')}</span>
                                                                        </td>
                                                                        <td style={{ padding: '8px' }}>
                                                                            {v.decision && (
                                                                                <span style={badgeStyle(v.decision === 'accepted' ? '#4caf50' : '#e53935')}>
                                                                                    {v.decision === 'accepted' ? 'Принята' : 'Отклонена'}
                                                                                </span>
                                                                            )}
                                                                            {v.rejection_reason && <div style={{ color: '#c62828', fontSize: '12px', marginTop: '4px' }}>{v.rejection_reason}</div>}
                                                                        </td>
                                                                        <td style={{ padding: '8px' }}>
                                                                            {v.file_url && <a href={`http://localhost:5000${v.file_url}`} target="_blank" rel="noreferrer" style={{ color: '#003366', textDecoration: 'underline' }}>Скачать</a>}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProgramCommitteeDashboard;
