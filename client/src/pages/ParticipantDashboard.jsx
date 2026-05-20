import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ParticipantDashboard = ({ activeTab, submissions, name, refreshData }) => {
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

    useEffect(() => {
        fetch("http://localhost:5000/api/public/sections")
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
            const response = await fetch(`http://localhost:5000/api/submissions/${editingSub.id}`, {
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
            const res = await fetch(`http://localhost:5000/api/submissions/${id}`, {
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
            const response = await fetch(`http://localhost:5000/api/submissions/${paymentModalSub.id}/payment`, {
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
        if (status === 'accepted') return <span style={{ ...baseStyle, background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc' }}>{language === 'ru' ? 'Принят' : 'Accepted'}</span>;
        if (status === 'published') return <span style={{ ...baseStyle, background: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' }}>{language === 'ru' ? 'Опубликован' : 'Published'}</span>;
        if (status === 'rejected') return <span style={{ ...baseStyle, background: '#f8d7da', color: '#842029', border: '1px solid #f5c6cb' }}>{language === 'ru' ? 'Отклонен' : 'Rejected'}</span>;
        return <span style={{ ...baseStyle, background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>{language === 'ru' ? 'На проверке' : 'Under Review'}</span>;
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
                                        </td>

                                        <td style={tdStyle}>
                                            <button onClick={() => openEditModal(sub)} style={{display: 'block', background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', marginBottom: '25px', textAlign: 'left'}}>{t('participant.edit')}</button>
                                            <button onClick={() => handleDelete(sub.id)} style={{background: 'none', border: 'none', color: '#0056b3', cursor: 'pointer', padding: 0, fontSize: '13px', textAlign: 'left'}}>{t('participant.delete')}</button>
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
        </div>
    );
};

export default ParticipantDashboard;
