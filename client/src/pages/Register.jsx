import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { registerUser } from '../api/auth';

const Register = () => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        country: 'Россия',
        city: 'Саратов',
        institution: 'СГТУ им. Гагарина Ю.А.',
        faculty: '',
        study_direction: '',
        academic_status: 'Студент',
        phone_number: '',
        email: '',
        password: '',
        password_repeat: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_repeat) {
            alert("Пароли не совпадают!");
            return;
        }

        try {
            const response = await registerUser(formData);
            const parseRes = await response.json();

            if (response.ok) {
                if (parseRes.token) {
                    localStorage.setItem("token", parseRes.token);
                }
                window.location.href = "/dashboard";
            } else {
                alert("Ошибка: " + parseRes);
            }
        } catch (err) {
            console.error(err.message);
            alert("Ошибка соединения с сервером");
        }
    };

    // --- СТИЛИ (Enterprise) ---
    const pageStyle = {
        minHeight: '100vh',
        background: '#f4f6f8',
        paddingBottom: '40px'
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '0 20px'
    };

    const cardStyle = {
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #e1e4e8',
        padding: '40px'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
    };

    const titleStyle = { margin: '0 0 10px 0', color: '#202124', fontSize: '24px', fontWeight: 'bold' };
    const subtitleStyle = { margin: 0, color: '#d93025', fontSize: '14px', fontWeight: '500' };

    // Сетка формы (2 колонки)
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    };

    const fullWidthStyle = {
        gridColumn: '1 / -1'
    };

    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#495057' };
    const inputStyle = {
        width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ced4da', borderRadius: '4px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s'
    };

    const sectionTitleStyle = {
        gridColumn: '1 / -1',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#003366',
        borderBottom: '2px solid #f1f3f5',
        paddingBottom: '10px',
        marginTop: '10px',
        marginBottom: '10px'
    };

    const btnStyle = {
        width: '100%', padding: '14px', background: '#003366', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px'
    };

    const radioLabelStyle = { marginRight: '20px', fontSize: '14px', color: '#333', cursor: 'pointer' };

    return (
        <div style={pageStyle}>
            <Navbar />
            
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Регистрация участника</h1>
                        <p style={subtitleStyle}>⚠ Достаточно регистрации только одного из авторов доклада!</p>
                    </div>

                    <form onSubmit={handleSubmit} style={gridStyle}>
                        
                        {/* ЛИЧНЫЕ ДАННЫЕ */}
                        <div style={sectionTitleStyle}>1. Личные данные</div>

                        <div>
                            <label style={labelStyle}>Фамилия *</label>
                            <input style={inputStyle} type="text" name="last_name" onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Имя *</label>
                            <input style={inputStyle} type="text" name="first_name" onChange={handleChange} required />
                        </div>
                        <div style={fullWidthStyle}>
                            <label style={labelStyle}>Отчество</label>
                            <input style={inputStyle} type="text" name="middle_name" onChange={handleChange} />
                        </div>

                        <div>
                            <label style={labelStyle}>Страна</label>
                            <select style={inputStyle} name="country" onChange={handleChange} value={formData.country}>
                                <option value="Россия">Россия</option>
                                <option value="Беларусь">Беларусь</option>
                                <option value="Казахстан">Казахстан</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Город</label>
                            <input style={inputStyle} type="text" name="city" onChange={handleChange} value={formData.city} />
                        </div>

                        {/* УЧЕБА / РАБОТА */}
                        <div style={sectionTitleStyle}>2. Место учебы / работы</div>

                        <div style={fullWidthStyle}>
                            <label style={labelStyle}>Учебное заведение (организация)</label>
                            <input style={inputStyle} type="text" name="institution" onChange={handleChange} value={formData.institution} />
                        </div>
                        <div style={fullWidthStyle}>
                            <label style={labelStyle}>Институт / Факультет</label>
                            <input style={inputStyle} type="text" name="faculty" placeholder="Напр. ИнПИТ" onChange={handleChange} />
                        </div>
                        <div style={fullWidthStyle}>
                            <label style={labelStyle}>Направление (специальность)</label>
                            <input style={inputStyle} type="text" name="study_direction" onChange={handleChange} />
                        </div>

                        <div style={fullWidthStyle}>
                            <label style={labelStyle}>Ваш статус:</label>
                            <div style={{ marginTop: '5px' }}>
                                <label style={radioLabelStyle}>
                                    <input type="radio" name="academic_status" value="Студент" defaultChecked onChange={handleChange} /> Студент
                                </label>
                                <label style={radioLabelStyle}>
                                    <input type="radio" name="academic_status" value="Аспирант" onChange={handleChange} /> Аспирант
                                </label>
                                <label style={radioLabelStyle}>
                                    <input type="radio" name="academic_status" value="Преподаватель" onChange={handleChange} /> Преподаватель
                                </label>
                            </div>
                        </div>

                        {/* КОНТАКТЫ */}
                        <div style={sectionTitleStyle}>3. Данные для входа</div>

                        <div>
                            <label style={labelStyle}>Телефон</label>
                            <input style={inputStyle} type="text" name="phone_number" placeholder="+7..." onChange={handleChange} />
                        </div>
                        <div>
                            <label style={labelStyle}>E-mail (Логин) *</label>
                            <input style={inputStyle} type="email" name="email" onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Пароль *</label>
                            <input style={inputStyle} type="password" name="password" onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Повторите пароль *</label>
                            <input style={inputStyle} type="password" name="password_repeat" onChange={handleChange} required />
                        </div>

                        <div style={fullWidthStyle}>
                            <button type="submit" style={btnStyle}>Зарегистрироваться</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
