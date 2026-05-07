import React, { useState, useEffect } from 'react';

const ProfileEditing = () => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        country: 'Россия',
        city: '',
        institution: '',
        academic_status: 'Студент'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/dashboard/profile", {
                    method: "GET",
                    headers: { token: localStorage.token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        last_name: data.last_name || '',
                        first_name: data.first_name || '',
                        middle_name: data.middle_name || '',
                        country: data.country || 'Россия',
                        city: data.city || '',
                        institution: data.institution || '',
                        academic_status: data.academic_status || 'Студент'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("http://localhost:5000/api/dashboard/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", token: localStorage.token },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Профиль успешно обновлен!");
                // Optionally reload to update sidebar name
                window.location.reload();
            } else {
                alert("Ошибка при обновлении профиля");
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка сети");
        } finally {
            setSaving(false);
        }
    };

    // --- СТИЛИ ---
    const containerStyle = { fontFamily: 'Arial, sans-serif' };
    const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #003366', paddingBottom: '15px', marginBottom: '20px' };
    const formBoxStyle = { background: '#fff', padding: '30px', border: '1px solid #dee2e6', borderRadius: '6px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
    const labelStyle = { display: 'block', fontSize: '12px', color: '#495057', marginBottom: '6px', fontWeight: '700', textTransform:'uppercase' };
    const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' };
    const radioLabelStyle = { display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '14px', color: '#333', cursor: 'pointer' };
    const btnStyle = { background: '#0056b3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' };

    if (loading) return <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>Загрузка профиля...</div>;

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h2 style={{margin: 0, color: '#333', fontSize: '24px', fontWeight: '600'}}>Редактирование профиля</h2>
            </div>
            
            <div style={formBoxStyle}>
                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>Фамилия:</label>
                    <input style={inputStyle} type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />

                    <label style={labelStyle}>Имя:</label>
                    <input style={inputStyle} type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />

                    <label style={labelStyle}>Отчество:</label>
                    <input style={inputStyle} type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} />

                    <label style={labelStyle}>Страна:</label>
                    <select style={inputStyle} name="country" value={formData.country} onChange={handleChange}>
                        <option value="Россия">Россия</option>
                        <option value="Беларусь">Беларусь</option>
                        <option value="Казахстан">Казахстан</option>
                    </select>

                    <label style={labelStyle}>Город:</label>
                    <input style={inputStyle} type="text" name="city" value={formData.city} onChange={handleChange} />

                    <label style={labelStyle}>Учебное заведение (организация):</label>
                    <input style={inputStyle} type="text" name="institution" value={formData.institution} onChange={handleChange} />

                    <label style={labelStyle}>Ваша должность:</label>
                    <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Преподаватель" checked={formData.academic_status === 'Преподаватель'} onChange={handleChange} style={{marginRight:'8px'}} /> Преподаватель</label>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Научный сотрудник" checked={formData.academic_status === 'Научный сотрудник'} onChange={handleChange} style={{marginRight:'8px'}} /> Научный сотрудник</label>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Аспирант" checked={formData.academic_status === 'Аспирант'} onChange={handleChange} style={{marginRight:'8px'}} /> Аспирант</label>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Магистр" checked={formData.academic_status === 'Магистр'} onChange={handleChange} style={{marginRight:'8px'}} /> Магистр</label>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Студент" checked={formData.academic_status === 'Студент'} onChange={handleChange} style={{marginRight:'8px'}} /> Студент</label>
                        <label style={radioLabelStyle}><input type="radio" name="academic_status" value="Другое" checked={formData.academic_status === 'Другое'} onChange={handleChange} style={{marginRight:'8px'}} /> Другое</label>
                    </div>

                    <button type="submit" style={{...btnStyle, opacity: saving ? 0.7 : 1}} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditing;
