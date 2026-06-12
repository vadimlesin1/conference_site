import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ConferenceInfoBlock from '../components/ConferenceInfoBlock';

const ParticipantDashboard = ({ activeTab, submissions, name, refreshData, activeConference }) => {
    const { t, language } = useLanguage();

    const [editingSub, setEditingSub] = useState(null);
    const [sections, setSections] = useState([]);
    
    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [advisorName, setAdvisorName] = useState("");
    const [advisorEmail, setAdvisorEmail] = useState("");
    const [advisorIsAuthor, setAdvisorIsAuthor] = useState(false);
    const [coauthorsList, setCoauthorsList] = useState("");
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [paymentModalSub, setPaymentModalSub] = useState(null);
    const [resubmitSub, setResubmitSub] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);
    const [resubmitTitle, setResubmitTitle] = useState('');
    const [resubmitAbstract, setResubmitAbstract] = useState('');
    const [resubmitSaving, setResubmitSaving] = useState(false);
    const [versionHistory, setVersionHistory] = useState([]);
    const [showVersionsFor, setShowVersionsFor] = useState(null);

    useEffect(() => {
        fetch((process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/public/sections")
            .then(res => res.json())
            .then(data => setSections(data))
            .catch(err => console.error(err));
    }, []);

    const openEditModal = (sub) => {
        setEditingSub(sub);
        setTitle(sub.title || "");
        setAbstract(sub.abstract || "");
        setSelectedSection(sub.section_id || (sections.length > 0 ? sections[0].id : ""));
        setAdvisorName(sub.advisor_name || "");
        setAdvisorEmail(sub.advisor_email || "");
        setAdvisorIsAuthor(sub.advisor_is_author || false);
        
        let coauthors = [];
        try {
            if (sub.coauthors_list) {
                const parsed = typeof sub.coauthors_list === 'string' ? JSON.parse(sub.coauthors_list) : sub.coauthors_list;
                if (Array.isArray(parsed)) coauthors = parsed;
            }
        } catch (e) {}
        setCoauthorsList(coauthors.join(', '));
        setFile(null);
    };

    const closeEditModal = () => {
        setEditingSub(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("abstract", abstract);
        formData.append("section_id", selectedSection);
        formData.append("advisor_name", advisorName);
        formData.append("advisor_email", advisorEmail);
        formData.append("advisor_is_author", advisorIsAuthor);
        formData.append("coauthors_list", JSON.stringify(coauthorsList.split(',').map(s => s.trim()).filter(Boolean)));
        
        if (file) formData.append("file", file);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${editingSub.id}`, {
                method: "PUT",
                headers: { token: localStorage.token },
                body: formData
            });
            const parseRes = await response.json();
            if (response.ok) {
                alert(language === 'ru' ? "Доклад обновлен!" : "Paper updated!");
                closeEditModal();
                if (refreshData) refreshData();
            } else {
                alert(parseRes.message || parseRes);
            }
        } catch (err) {
            console.error(err);
            alert(t('common.networkError'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(language === 'ru' ? "Удалить этот доклад?" : "Delete this paper?")) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${id}`, {
                method: "DELETE",
                headers: { token: localStorage.token }
            });
            if (res.ok) {
                alert(language === 'ru' ? "Доклад удален" : "Paper deleted");
                if (refreshData) refreshData();
            } else {
                const data = await res.json();
                alert(data.message || data);
            }
        } catch(err) {
            console.error(err);
        }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${paymentModalSub.id}/payment`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify({ payment_status: 'pending_verification' })
            });
            if (response.ok) {
                alert(language === 'ru' ? "Заявка на оплату отправлена. Ожидайте подтверждения организатором." : "Payment request sent. Awaiting organizer confirmation.");
                setPaymentModalSub(null);
                if (refreshData) refreshData();
            } else {
                const text = await response.text();
                alert(text);
            }
        } catch (err) {
            console.error(err);
            alert(t('common.networkError'));
        }
    };

    const openResubmit = (sub) => {
        setResubmitSub(sub);
        setResubmitTitle(sub.title || '');
        setResubmitAbstract(sub.abstract || '');
        setResubmitFile(null);
    };

    const handleResubmit = async (e) => {
        e.preventDefault();
        if (!resubmitFile) {
            alert(language === 'ru' ? 'Прикрепите исправленный файл' : 'Attach the corrected file');
            return;
        }
        setResubmitSaving(true);
        const formData = new FormData();
        formData.append('title', resubmitTitle);
        formData.append('abstract', resubmitAbstract);
        formData.append('file', resubmitFile);

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${resubmitSub.id}/resubmit`, {
                method: 'PUT',
                headers: { token: localStorage.token },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Доклад отправлен повторно');
                setResubmitSub(null);
                if (refreshData) refreshData();
            } else {
                alert(typeof data === 'string' ? data : data.message || 'Ошибка');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setResubmitSaving(false);
        }
    };

    const loadVersions = async (subId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submissions/${subId}/versions`, {
                headers: { token: localStorage.token }
            });
            if (res.ok) {
                setVersionHistory(await res.json());
                setShowVersionsFor(subId);
            }
        } catch (err) { console.error(err); }
    };

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
        const statusMap = {
            accepted: { bg: '#d1e7dd', color: '#0f5132', border: '#badbcc', label: language === 'ru' ? 'Принят' : 'Accepted' },
            published: { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db', label: language === 'ru' ? 'Опубликован' : 'Published' },
            rejected: { bg: '#f8d7da', color: '#842029', border: '#f5c6cb', label: language === 'ru' ? 'Отклонен' : 'Rejected' },
            under_review: { bg: '#cce5ff', color: '#004085', border: '#b8daff', label: language === 'ru' ? 'На рецензии' : 'Under Review' },
            reviewed: { bg: '#cce5ff', color: '#004085', border: '#b8daff', label: language === 'ru' ? 'На рецензии' : 'Under Review' },
            revision_requested: { bg: '#fff3cd', color: '#856404', border: '#ffeeba', label: language === 'ru' ? 'Требует доработки' : 'Revision Required' },
            revision_submitted: { bg: '#cff4fc', color: '#055160', border: '#b6effb', label: language === 'ru' ? 'Исправлено автором' : 'Revision Submitted' },
            final_rejected: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', label: language === 'ru' ? 'Окончательно отклонён' : 'Final Rejected' },
            pending: { bg: '#fff3cd', color: '#856404', border: '#ffeeba', label: language === 'ru' ? 'На проверке' : 'Pending' },
        };
        const s = statusMap[status] || statusMap.pending;
        return <span style={{ ...baseStyle, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>;
    };

    return (
        <div style={containerStyle}>
            <div className="dashboard-header-row" style={headerRow}>
                <h3 style={{margin: 0, color: '#333', fontSize: '24px', fontWeight: '600'}}>{t('dashboard.participant')}</h3>
                <Link to="/create-submission" style={btnPrimary}>
                    <IconPlus /> {t('participant.newSubmission')}
                </Link>
            </div>



            {activeTab === 'my_submissions' && (
                <>
                    {submissions.length === 0 ? (
                        <div style={{ padding: '40px', background: '#f8f9fa', color: '#6c757d', border: '2px dashed #dee2e6', borderRadius: '6px', textAlign: 'center' }}>
                            {t('participant.noSubmissions')}
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper">
                            <table style={tableStyle}>
                                <thead>
                                <tr>
                                    <th style={thStyle}>№</th>
                                    <th style={thStyle}>{language === 'ru' ? 'ФИО, соавторы' : 'Authors'}</th>
                                    <th style={thStyle}>{t('participant.title')}</th>
                                    <th style={thStyle}>{t('participant.file')}</th>
                                    <th style={thStyle}>{t('participant.payment')}</th>
                                    <th style={thStyle}>{t('participant.status')}</th>
                                    <th style={thStyle}>{t('participant.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => {
                                    // Разбор JSON массива соавторов
                                    let coauthors = [];
                                    try {
                                        if (sub.coauthors_list) {
                                            const parsed = typeof sub.coauthors_list === 'string' ? JSON.parse(sub.coauthors_list) : sub.coauthors_list;
                                            if (Array.isArray(parsed)) coauthors = parsed;
                                        }
                                    } catch (e) {}

                                    return (
                                    <tr key={sub.id}>
                                        <td style={tdStyle}>{sub.id}</td>
                                        
                                        <td style={tdStyle}>
                                            <div style={{color: '#555', marginBottom: '15px'}}>{name}</div>
                                            
                                            {sub.advisor_name ? (
                                                <div style={{color: '#777', marginBottom: '15px', fontSize: '13px', lineHeight: '1.4'}}>
                                                    {t('participant.advisor')}:<br/>{sub.advisor_name}
                                                </div>
                                            ) : (
                                                <div style={{color: '#777', marginBottom: '15px', fontSize: '13px', lineHeight: '1.4'}}>
                                                    {t('participant.advisor')}:<br/>{language === 'ru' ? 'отсутствует' : 'none'}
                                                </div>
                                            )}
                                            
                                            {coauthors.length > 0 ? (
                                                <div style={{color: '#777', marginBottom: '20px', fontSize: '13px'}}>
                                                    {t('participant.coauthors')}:<br/>{coauthors.join(', ')}
                                                </div>
                                            ) : (
                                                <div style={{color: '#777', marginBottom: '20px', fontSize: '13px'}}>
                                                    {t('participant.coauthors')}<br/>{language === 'ru' ? 'отсутствуют' : 'none'}
                                                </div>
                                            )}

                                            <div style={{fontSize: '13px'}}>
                                                <button onClick={() => openEditModal(sub)} style={{background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', textDecoration: 'none'}}>{language === 'ru' ? 'Добавить соавтора' : 'Add co-author'}</button>
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                            <div style={{color: '#333', marginBottom: '15px', lineHeight: '1.4'}}>{sub.title}</div>
                                            <div style={{color: '#666', fontSize: '13px'}}>{t('participant.section')}: {sub.section_name}</div>
                                        </td>

                                        <td style={tdStyle}>
                                            <div style={{color: '#555', fontSize: '13px', marginBottom: '5px'}}>{language === 'ru' ? 'Загружен' : 'Uploaded'}:<br/>{new Date(sub.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {day: '2-digit', month: '2-digit'})}</div>
                                            {sub.file_url && (
                                                <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noreferrer" style={{color: '#0056b3', textDecoration: 'none', fontSize: '13px'}}>{language === 'ru' ? 'Скачать' : 'Download'}</a>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            <div style={{color: '#555', fontSize: '13px', marginBottom: '5px'}}>
                                                {sub.payment_status === 'paid' ? (language === 'ru' ? 'Оплачен' : 'Paid') 
                                                : sub.payment_status === 'pending_verification' ? (language === 'ru' ? 'Ожидает подтверждения' : 'Pending') 
                                                : (language === 'ru' ? 'Не оплачен' : 'Unpaid')}
                                            </div>
                                            {sub.status === 'accepted' && sub.payment_status === 'unpaid' && (
                                                <button onClick={() => setPaymentModalSub(sub)} style={{background: '#198754', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', marginTop: '5px'}}>
                                                    {language === 'ru' ? 'Оплатить' : 'Pay'}
                                                </button>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {getStatusBadge(sub.status)}
                                            {sub.rejection_count > 0 && (
                                                <div style={{ fontSize: '11px', color: '#c62828', marginTop: '6px' }}>
                                                    {language === 'ru' ? `Отказов: ${sub.rejection_count}/3` : `Rejections: ${sub.rejection_count}/3`}
                                                </div>
                                            )}
                                        </td>

                                        <td style={tdStyle}>
                                            {sub.status === 'pending' && (
                                                <>
                                                    <button onClick={() => openEditModal(sub)} style={{display: 'block', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', marginBottom: '8px', textAlign: 'left'}}>{t('participant.edit')}</button>
                                                    {!sub.reviewer_id && (
                                                        <button onClick={() => handleDelete(sub.id)} style={{display: 'block', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', marginBottom: '8px', textAlign: 'left'}}>{t('participant.delete')}</button>
                                                    )}
                                                </>
                                            )}
                                            {sub.status === 'revision_requested' && (
                                                <button onClick={() => openResubmit(sub)} style={{display: 'block', background: '#ef6c00', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', marginBottom: '8px', fontWeight: '600'}}>
                                                    {language === 'ru' ? 'Исправить' : 'Revise'}
                                                </button>
                                            )}
                                            {(sub.current_version > 1 || sub.rejection_count > 0) && (
                                                <button onClick={() => loadVersions(sub.id)} style={{display: 'block', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', textAlign: 'left'}}>
                                                    {language === 'ru' ? 'История версий' : 'Version History'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                        </div>
                    )}
                </>
            )}

            {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ */}
            {editingSub && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
                    <div className="responsive-modal" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>{language === 'ru' ? 'Редактирование доклада' : 'Edit Paper'}</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Название доклада' : 'Paper Title'} *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Секция' : 'Section'} *</label>
                                <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}>
                                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Научный руководитель (ФИО)' : 'Advisor (Full Name)'}</label>
                                <input type="text" value={advisorName} onChange={e => setAdvisorName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Почта руководителя' : 'Advisor Email'}</label>
                                <input type="email" value={advisorEmail} onChange={e => setAdvisorEmail(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '13px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={advisorIsAuthor} onChange={e => setAdvisorIsAuthor(e.target.checked)} style={{ marginRight: '8px' }} />
                                {language === 'ru' ? 'Руководитель является соавтором' : 'Advisor is co-author'}
                            </label>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Соавторы (ФИО через запятую)' : 'Co-authors (comma separated)'}</label>
                                <input type="text" value={coauthorsList} onChange={e => setCoauthorsList(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Новый файл (необязательно)' : 'New file (optional)'}</label>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} style={{ fontSize: '13px' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={closeEditModal} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                                <button type="submit" disabled={saving} style={{ padding: '8px 15px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{saving ? (language === 'ru' ? 'Сохранение...' : 'Saving...') : t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО ОПЛАТЫ */}
            {paymentModalSub && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
                    <div className="responsive-modal" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>{t('participant.paymentTitle')}</h3>
                        <p style={{fontSize: '14px', color: '#555', lineHeight: '1.5', marginBottom: '20px'}}>
                            {language === 'ru' 
                                ? <>Для подтверждения участия и публикации доклада <strong>"{paymentModalSub.title}"</strong> необходимо произвести оплату.</>
                                : <>To confirm participation and publish paper <strong>"{paymentModalSub.title}"</strong>, {t('participant.paymentRequired')}</>}
                        </p>
                        <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', color: '#333'}}>
                            <strong>{t('participant.paymentDetails')}</strong><br/>
                            ИНН: 1234567890<br/>
                            Р/С: 40702810000000000000<br/>
                            Банк: ПАО Сбербанк<br/>
                            Сумма: 1500 руб.
                        </div>
                        <form onSubmit={handlePaySubmit}>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button type="button" onClick={() => setPaymentModalSub(null)} style={{background: 'none', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}>{t('participant.cancel')}</button>
                                <button type="submit" style={{...btnPrimary, background: '#198754'}}>{t('participant.iPaid')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО ПОВТОРНОЙ ОТПРАВКИ */}
            {resubmitSub && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
                    <div className="responsive-modal" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#e65100' }}>️ Повторная отправка</h3>
                        <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                            {language === 'ru' 
                                ? `Попытка ${(resubmitSub.rejection_count || 0) + 1} из 3. Исправьте доклад и прикрепите новый файл.`
                                : `Attempt ${(resubmitSub.rejection_count || 0) + 1} of 3. Fix the paper and attach a new file.`}
                        </p>
                        <form onSubmit={handleResubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Название' : 'Title'}</label>
                                <input type="text" value={resubmitTitle} onChange={e => setResubmitTitle(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Аннотация' : 'Abstract'}</label>
                                <textarea value={resubmitAbstract} onChange={e => setResubmitAbstract(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>{language === 'ru' ? 'Исправленный файл *' : 'Corrected file *'}</label>
                                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResubmitFile(e.target.files[0])} required style={{ fontSize: '13px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setResubmitSub(null)} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{language === 'ru' ? 'Отмена' : 'Cancel'}</button>
                                <button type="submit" disabled={resubmitSaving} style={{ padding: '8px 15px', background: '#ef6c00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                                    {resubmitSaving ? 'Отправка...' : (language === 'ru' ? 'Отправить повторно' : 'Resubmit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО ИСТОРИИ ВЕРСИЙ */}
            {showVersionsFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
                    <div className="responsive-modal" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '550px', maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#003366' }}> {language === 'ru' ? 'История версий' : 'Version History'}</h3>
                            <button onClick={() => setShowVersionsFor(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}></button>
                        </div>
                        {versionHistory.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>{language === 'ru' ? 'Нет сохранённых версий' : 'No saved versions'}</p>
                        ) : (
                            versionHistory.map((v, i) => (
                                <div key={i} style={{ padding: '14px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ color: '#003366' }}>{language === 'ru' ? 'Версия' : 'Version'} {v.version_number}</strong>
                                            <span style={{ color: '#888', fontSize: '13px', marginLeft: '12px' }}>
                                                {new Date(v.uploaded_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        {v.decision && (
                                            <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', 
                                                background: v.decision === 'accepted' ? '#d1e7dd' : '#f8d7da',
                                                color: v.decision === 'accepted' ? '#0f5132' : '#842029' }}>
                                                {v.decision === 'accepted' ? 'Принят' : 'Отклонён'}
                                            </span>
                                        )}
                                    </div>
                                    {v.rejection_reason && <p style={{ color: '#c62828', fontSize: '13px', margin: '8px 0 0' }}>Причина: {v.rejection_reason}</p>}
                                    {v.comment && <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0', fontStyle: 'italic' }}> {v.comment}</p>}
                                    {v.file_url && (
                                        <a href={`http://localhost:5000${v.file_url}`} target="_blank" rel="noreferrer"
                                           style={{ color: '#0056b3', fontSize: '13px', textDecoration: 'underline', display: 'inline-block', marginTop: '8px' }}>
                                             {language === 'ru' ? 'Скачать' : 'Download'}
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantDashboard;
