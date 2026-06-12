import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ConferenceInfoBlock from '../components/ConferenceInfoBlock';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const REJECTION_REASONS = [
    'Несоответствие тематике конференции',
    'Недостаточная научная новизна',
    'Ошибки в методологии',
    'Некорректное оформление',
];

const ReviewerDashboard = ({ activeTab, activeConference }) => {
    const { t, language } = useLanguage();
    const [assigned, setAssigned] = useState([]);
    const [available, setAvailable] = useState([]);
    const [loading, setLoading] = useState(true);
    const initialReviewForm = {
        submissionId: null,
        q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '', q12: '',
        conclusion: ''
    };
    const [reviewForm, setReviewForm] = useState(initialReviewForm);
    const [versions, setVersions] = useState([]);
    const [showVersionsFor, setShowVersionsFor] = useState(null);
    const [message, setMessage] = useState('');
    const [revSearchQuery, setRevSearchQuery] = useState('');
    const [revStatusFilter, setRevStatusFilter] = useState('all');

    const headers = { token: localStorage.token };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignedRes, availableRes] = await Promise.all([
                fetch(`${API}/review/assigned`, { headers }),
                fetch(`${API}/review/available`, { headers })
            ]);
            if (assignedRes.ok) setAssigned(await assignedRes.json());
            if (availableRes.ok) setAvailable(await availableRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const claimSubmission = async (id) => {
        try {
            const res = await fetch(`${API}/review/claim/${id}`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setMessage(typeof data === 'string' ? data : data.message || 'Готово');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const submitReview = async () => {
        try {
            let decision = 'rejected';
            let reason = '';
            
            if (reviewForm.conclusion === 'c1') {
                decision = 'accepted';
                reason = '';
            } else if (reviewForm.conclusion === 'c2') {
                reason = 'Статья может быть рекомендована для печати после устранения замечаний';
            } else if (reviewForm.conclusion === 'c3') {
                reason = 'Требуется значительная переработка статьи и повторное рецензирование';
            } else if (reviewForm.conclusion === 'c4') {
                reason = 'Статья не рекомендуется для печати';
            } else {
                return alert("Выберите заключение рецензента!");
            }

            const compiledComment = `1. Соответствует содержание статьи ее названию?\nОтвет: ${reviewForm.q1}\n\n` +
                                    `2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?\nОтвет: ${reviewForm.q2}\n\n` +
                                    `3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?\nОтвет: ${reviewForm.q3}\n\n` +
                                    `4. Обоснована в статье актуальность научной проблемы?\nОтвет: ${reviewForm.q4}\n\n` +
                                    `5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?\nОтвет: ${reviewForm.q5}\n\n` +
                                    `6. Корректно сформулированы выводы?\nОтвет: ${reviewForm.q6}\n\n` +
                                    `7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?\nОтвет: ${reviewForm.q7}\n\n` +
                                    `8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?\nОтвет: ${reviewForm.q8}\n\n` +
                                    `9. В чем заключается научная и/или практическая значимость?\nОтвет: ${reviewForm.q9}\n\n` +
                                    `10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?\nОтвет: ${reviewForm.q10}\n\n` +
                                    `11. В статье есть ошибочные утверждения?\nОтвет: ${reviewForm.q11}\n\n` +
                                    `12. Дополнительные замечания и комментарии по тексту статьи\nОтвет: ${reviewForm.q12}\n\n` +
                                    `ЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА:\n${reason || 'Статья рекомендуется для печати в представленном виде'}`;

            const res = await fetch(`${API}/review/submit/${reviewForm.submissionId}`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decision,
                    rejection_reason: reason,
                    comment: compiledComment
                })
            });
            const data = await res.json();
            setMessage(typeof data === 'string' ? data : data.message || 'Рецензия отправлена');
            setReviewForm(initialReviewForm);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const loadVersions = async (subId) => {
        try {
            const res = await fetch(`${API}/review/versions/${subId}`, { headers });
            if (res.ok) {
                setVersions(await res.json());
                setShowVersionsFor(subId);
            }
        } catch (err) { console.error(err); }
    };

    // Стили
    const cardStyle = {
        background: '#fff', border: '1px solid #e0e4e8', borderRadius: '10px',
        padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    };
    const btnPrimary = {
        background: 'linear-gradient(135deg, #003366, #0056b3)', color: '#fff',
        border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer',
        fontWeight: '600', fontSize: '14px', transition: 'opacity 0.2s'
    };
    const btnSuccess = { ...btnPrimary, background: 'linear-gradient(135deg, #2e7d32, #4caf50)' };
    const btnDanger = { ...btnPrimary, background: 'linear-gradient(135deg, #c62828, #e53935)' };
    const btnOutline = {
        background: 'transparent', color: '#003366', border: '2px solid #003366',
        borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
    };
    const badgeStyle = (color) => ({
        display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', background: color + '15', color: color, border: `1px solid ${color}33`
    });
    const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };

    const statusColors = {
        pending: '#ff9800', under_review: '#1565c0', revision_requested: '#ef6c00',
        accepted: '#4caf50', rejected: '#e53935', final_rejected: '#b71c1c', published: '#9c27b0'
    };
    const statusLabels = {
        pending: 'На рассмотрении', under_review: 'На рецензии', revision_requested: 'Требует доработки',
        accepted: 'Принят', rejected: 'Отклонён', final_rejected: 'Окончательно отклонён', published: 'Опубликован'
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Загрузка...</div>;

    // ===== ДОСТУПНЫЕ ДОКЛАДЫ =====
    if (activeTab === 'available') {
        return (
            <div>

                <h2 style={{ color: '#003366', marginBottom: '24px', fontSize: '22px' }}>Доступные доклады</h2>
                {message && <div style={{ padding: '12px 20px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', marginBottom: '16px', color: '#2e7d32' }}>{message}</div>}
                
                {available.length === 0 ? (
                    <div style={{ ...cardStyle, textAlign: 'center', color: '#888' }}>
                        <p style={{ fontSize: '16px' }}>Нет доступных докладов для рецензирования</p>
                        <p style={{ fontSize: '14px', color: '#aaa' }}>Доклады появятся после дедлайна подачи</p>
                    </div>
                ) : (
                    available.map(sub => (
                        <div key={sub.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 8px', color: '#003366', fontSize: '17px' }}>{sub.title}</h3>
                                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 6px' }}>
                                         {sub.author_name} &nbsp;|&nbsp;  {sub.section_name}
                                    </p>
                                    {sub.abstract && <p style={{ color: '#888', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden' }}>{sub.abstract}</p>}
                                </div>
                                <button style={btnPrimary} onClick={() => claimSubmission(sub.id)}>
                                    Взять на рецензию
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    // ===== НАЗНАЧЕННЫЕ ДОКЛАДЫ (default) =====
    const filteredAssigned = assigned.filter(sub => {
        const query = revSearchQuery.toLowerCase();
        const matchesSearch = (sub.title && sub.title.toLowerCase().includes(query)) ||
                              (sub.author_name && sub.author_name.toLowerCase().includes(query));
        const matchesStatus = revStatusFilter === 'all' || sub.status === revStatusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ color: '#003366', margin: 0, fontSize: '22px' }}>Мои рецензии</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Поиск по названию или автору..." 
                        value={revSearchQuery}
                        onChange={(e) => setRevSearchQuery(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', width: '280px', outline: 'none' }}
                    />
                    <select 
                        value={revStatusFilter}
                        onChange={(e) => setRevStatusFilter(e.target.value)}
                        style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
                    >
                        <option value="all">Все статусы</option>
                        <option value="under_review">На рецензии</option>
                        <option value="reviewed">Оценено</option>
                    </select>
                </div>
            </div>

            {message && (
                <div style={{ padding: '12px 20px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', marginBottom: '24px', color: '#2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#2e7d32' }}>&times;</button>
                </div>
            )}

            {filteredAssigned.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', color: '#888', padding: '40px' }}>
                    {assigned.length === 0 ? (
                        <>
                            <p style={{ fontSize: '16px', marginBottom: '8px' }}>У вас пока нет назначенных докладов</p>
                            <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Перейдите во вкладку «Доступные доклады», чтобы взять работу на рецензию</p>
                        </>
                    ) : (
                        <p style={{ fontSize: '16px', margin: 0 }}>Доклады не найдены. Попробуйте изменить фильтры.</p>
                    )}
                </div>
            ) : (
                filteredAssigned.map(sub => (
                    <div key={sub.id} style={{ ...cardStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: `5px solid ${statusColors[sub.status] || '#ccc'}`, marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: '20px' }}>
                                <h3 style={{ margin: '0 0 12px', color: '#003366', fontSize: '19px', lineHeight: '1.4' }}>{sub.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#555', fontSize: '14px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <strong style={{ color: '#333', marginRight: '6px' }}>Автор:</strong> {sub.author_name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#e3f2fd', padding: '2px 8px', borderRadius: '4px', color: '#0056b3' }}>
                                        <strong style={{ marginRight: '6px' }}>Секция:</strong> {sub.section_name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <strong style={{ color: '#333', marginRight: '6px' }}>Версия:</strong> {sub.current_version || 1}
                                    </div>
                                    {sub.rejection_count > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#c62828' }}>
                                            <strong style={{ marginRight: '6px' }}>Отказов:</strong> {sub.rejection_count}/3
                                        </div>
                                    )}
                                </div>
                                {sub.abstract && (
                                    <p style={{ color: '#555', fontSize: '14px', margin: 0, lineHeight: 1.6, background: '#f8f9fa', padding: '12px 16px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                        <strong style={{ display: 'block', marginBottom: '6px', color: '#333' }}>Аннотация:</strong>
                                        {sub.abstract}
                                    </p>
                                )}
                            </div>
                            <span style={{ ...badgeStyle(statusColors[sub.status] || '#666'), fontSize: '13px', padding: '6px 16px', whiteSpace: 'nowrap' }}>
                                {statusLabels[sub.status] || sub.status}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
                            {sub.file_url && (
                                <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer"
                                   style={{ ...btnOutline, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: '14px', padding: '8px 16px' }}>
                                     Скачать файл
                                </a>
                            )}
                            <button style={{ ...btnOutline, fontSize: '14px', padding: '8px 16px' }} onClick={() => loadVersions(sub.id)}>
                                 История версий
                            </button>
                            {sub.status === 'under_review' && (
                                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                                    <button style={{ ...btnSuccess, fontSize: '14px', padding: '8px 20px', background: '#003366', color: '#fff' }} onClick={() => setReviewForm({ ...initialReviewForm, submissionId: sub.id })}>
                                         Заполнить анкету
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Форма рецензии */}
                        {reviewForm.submissionId === sub.id && (
                            <div style={{ background: '#fff', border: '2px solid #e9ecef', borderRadius: '8px', padding: '24px', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 20px', color: '#003366', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                                    Анкета рецензента
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>1. Соответствует содержание статьи ее названию?</label>
                                        <input type="text" value={reviewForm.q1} onChange={e => setReviewForm({...reviewForm, q1: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>2. Соответствует тематика статьи указанному номеру научной специальности по классификации ВАК?</label>
                                        <input type="text" value={reviewForm.q2} onChange={e => setReviewForm({...reviewForm, q2: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>3. Соответствуют ключевые слова (словосочетания) содержанию статьи? Отражают ее предметную и терминологическую область?</label>
                                        <input type="text" value={reviewForm.q3} onChange={e => setReviewForm({...reviewForm, q3: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>4. Обоснована в статье актуальность научной проблемы?</label>
                                        <input type="text" value={reviewForm.q4} onChange={e => setReviewForm({...reviewForm, q4: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>5. Обладают материалы исследований научной новизной? Если да, то в чем она заключается?</label>
                                        <textarea rows={3} value={reviewForm.q5} onChange={e => setReviewForm({...reviewForm, q5: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>6. Корректно сформулированы выводы?</label>
                                        <input type="text" value={reviewForm.q6} onChange={e => setReviewForm({...reviewForm, q6: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>7. Проведен анализ и сопоставление полученных результатов с результатами ранее известных исследований?</label>
                                        <input type="text" value={reviewForm.q7} onChange={e => setReviewForm({...reviewForm, q7: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>8. Отражают цитируемые источники библиографии современную точку зрения исследуемой проблемы и соответствуют содержанию статьи?</label>
                                        <input type="text" value={reviewForm.q8} onChange={e => setReviewForm({...reviewForm, q8: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>9. В чем заключается научная и/или практическая значимость?</label>
                                        <textarea rows={3} value={reviewForm.q9} onChange={e => setReviewForm({...reviewForm, q9: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>10. Какой вклад в развитие авиационно-космической техники вносят полученные результаты?</label>
                                        <textarea rows={3} value={reviewForm.q10} onChange={e => setReviewForm({...reviewForm, q10: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>11. В статье есть ошибочные утверждения?</label>
                                        <input type="text" value={reviewForm.q11} onChange={e => setReviewForm({...reviewForm, q11: e.target.value})} style={inputStyle} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>12. Дополнительные замечания и комментарии по тексту статьи</label>
                                        <textarea rows={4} value={reviewForm.q12} onChange={e => setReviewForm({...reviewForm, q12: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
                                    </div>

                                    <div style={{ marginTop: '12px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#003366', fontSize: '16px' }}>ЗАКЛЮЧЕНИЕ РЕЦЕНЗЕНТА *</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                                                <input type="radio" name="conclusion" value="c1" checked={reviewForm.conclusion === 'c1'} onChange={e => setReviewForm({...reviewForm, conclusion: e.target.value})} />
                                                Статья рекомендуется для печати в представленном виде
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                                                <input type="radio" name="conclusion" value="c2" checked={reviewForm.conclusion === 'c2'} onChange={e => setReviewForm({...reviewForm, conclusion: e.target.value})} />
                                                Статья может быть рекомендована для печати после устранения замечаний
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                                                <input type="radio" name="conclusion" value="c3" checked={reviewForm.conclusion === 'c3'} onChange={e => setReviewForm({...reviewForm, conclusion: e.target.value})} />
                                                Требуется значительная переработка статьи и повторное рецензирование
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                                                <input type="radio" name="conclusion" value="c4" checked={reviewForm.conclusion === 'c4'} onChange={e => setReviewForm({...reviewForm, conclusion: e.target.value})} />
                                                Статья не рекомендуется для печати
                                            </label>
                                        </div>
                                    </div>

                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        style={{ ...btnOutline, fontSize: '14px', padding: '10px 20px', border: 'none', color: '#666' }}
                                        onClick={() => setReviewForm(initialReviewForm)}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        style={{ ...btnSuccess, fontSize: '14px', padding: '10px 24px', background: '#003366' }}
                                        onClick={submitReview}
                                        disabled={!reviewForm.conclusion}
                                    >
                                        Отправить рецензию
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* История версий */}
                        {showVersionsFor === sub.id && versions.length > 0 && (
                            <div style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', marginTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ margin: 0, color: '#003366' }}> История версий</h4>
                                    <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', padding: '0', lineHeight: 1 }} onClick={() => setShowVersionsFor(null)}>&times;</button>
                                </div>
                                {versions.map((v, i) => (
                                    <div key={i} style={{ padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong style={{ color: '#003366' }}>Версия {v.version_number}</strong>
                                                <span style={{ color: '#888', fontSize: '13px', marginLeft: '12px' }}>
                                                    {new Date(v.uploaded_at).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                            {v.decision && (
                                                <span style={badgeStyle(v.decision === 'accepted' ? '#4caf50' : '#e53935')}>
                                                    {v.decision === 'accepted' ? 'Принят' : 'Отклонён'}
                                                </span>
                                            )}
                                        </div>
                                        {v.rejection_reason && <p style={{ color: '#c62828', fontSize: '13px', margin: '8px 0 0' }}>Причина: {v.rejection_reason}</p>}
                                        {v.comment && <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>Комментарий: {v.comment}</p>}
                                        {v.file_url && (
                                            <a href={`http://localhost:5000${v.file_url}`} target="_blank" rel="noreferrer"
                                               style={{ color: '#0056b3', fontSize: '13px', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}>
                                                 Скачать
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ReviewerDashboard;
