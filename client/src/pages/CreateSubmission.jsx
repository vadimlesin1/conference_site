import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const CreateSubmission = () => {
    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState(""); 
    const [sections, setSections] = useState([]); 
    const [selectedSection, setSelectedSection] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    // 1. Загружаем список секций
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/public/sections");
                const jsonData = await response.json();
                setSections(jsonData);
                if (jsonData.length > 0) {
                    setSelectedSection(jsonData[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSections();
    }, []);

    // 2. Отправка формы
    const onSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true); 
        
        const formData = new FormData();
        formData.append("title", title);
        formData.append("abstract", abstract); 
        formData.append("section_id", selectedSection);
        
        // Добавляем файл ТОЛЬКО если он выбран
        if (file) {
            formData.append("file", file);
        }

        try {
            const response = await fetch("http://localhost:5000/api/submissions", {
                method: "POST",
                headers: { token: localStorage.token },
                body: formData
            });

            const parseRes = await response.json();

            if (response.ok) {
                // Если успешно (200 OK)
                alert(parseRes.message || "Успешно отправлено!"); 
                navigate("/dashboard");
            } else {
                // Если ошибка (400, 403, 500) - показываем текст ошибки от сервера
                // parseRes может быть строкой или объектом { message: "..." }
                const errorMsg = typeof parseRes === 'string' ? parseRes : (parseRes.message || "Ошибка отправки");
                alert(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка сети. Проверьте подключение к серверу.");
            setLoading(false);
        }
    };

    // --- СТИЛИ (Enterprise) ---
    const pageStyle = { minHeight: '100vh', background: '#f4f6f8', paddingBottom: '40px' };
    const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '0 20px' };
    const cardStyle = { background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e1e4e8' };
    const headerStyle = { marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' };
    const h1Style = { margin: '0 0 10px 0', color: '#202124', fontSize: '24px', fontWeight: 'bold' };
    const pStyle = { margin: 0, color: '#5f6368', fontSize: '14px' };
    const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#495057' };
    
    const inputStyle = {
        width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px', 
        boxSizing: 'border-box', marginBottom: '20px', outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit'
    };
    
    const textareaStyle = { ...inputStyle, minHeight: '100px', resize: 'vertical' };

    const btnStyle = {
        width: '100%', padding: '12px', background: loading ? '#6c757d' : '#003366', color: '#fff', 
        border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', 
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
    };

    const fileInputStyle = { ...inputStyle, padding: '8px', background: '#f8f9fa' };

    return (
        <div style={pageStyle}>
            <Navbar />
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h1 style={h1Style}>Подача доклада</h1>
                        <p style={pStyle}>Заполните форму для участия в конференции.</p>
                    </div>
                    
                    <form onSubmit={onSubmitForm}>
                        <label style={labelStyle}>Название доклада *</label>
                        <input 
                            type="text" 
                            style={inputStyle}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="Введите полное название темы..."
                            onFocus={(e) => e.target.style.borderColor = '#003366'}
                            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        />

                        <label style={labelStyle}>Аннотация (Abstract)</label>
                        <textarea 
                            style={textareaStyle}
                            value={abstract}
                            onChange={e => setAbstract(e.target.value)}
                            placeholder="Краткое описание доклада (2-3 предложения)..."
                            onFocus={(e) => e.target.style.borderColor = '#003366'}
                            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        />

                        <label style={labelStyle}>Выберите секцию *</label>
                        <select 
                            style={inputStyle}
                            value={selectedSection}
                            onChange={e => setSelectedSection(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#003366'}
                            onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        >
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.id}>
                                    {sec.title}
                                </option>
                            ))}
                        </select>

                        <label style={labelStyle}>Файл доклада (PDF/Word)</label>
                        {/* Убрали required, чтобы можно было обновлять без перезаливки */}
                        <input 
                            type="file" 
                            style={fileInputStyle}
                            onChange={e => setFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx"
                        />
                        <div style={{fontSize: '12px', color: '#888', marginTop: '-15px', marginBottom: '25px'}}>
                            При обновлении заявки загружать файл не обязательно (останется старый).
                        </div>

                        <button type="submit" style={btnStyle} disabled={loading}>
                            {loading ? "Отправка..." : "Отправить / Обновить"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSubmission;
