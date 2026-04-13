import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("");
    const [showDropdown, setShowDropdown] = useState(false); 
    
    const location = useLocation();
    const navigate = useNavigate();

    // Загрузка пользователя
    useEffect(() => {
        const checkAuth = async () => {
            if (localStorage.getItem("token")) {
                try {
                    const response = await fetch("http://localhost:5000/api/dashboard/", {
                        method: "GET",
                        headers: { token: localStorage.token }
                    });

                    if (response.ok) {
                        const parseRes = await response.json();
                        const name = parseRes.user ? parseRes.user.full_name : parseRes.full_name;
                        setUserName(name || "Личный кабинет");
                        setIsAuthenticated(true);
                    } else {
                        handleLogout();
                    }
                } catch (err) {
                    console.error(err);
                    handleLogout();
                }
            }
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserName("");
        setShowDropdown(false);
        navigate("/"); 
        window.location.reload(); 
    };

    // --- SVG ИКОНКИ ---
    const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8, verticalAlign:'text-bottom'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8, verticalAlign:'text-bottom'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
    const IconChevron = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:6}}><polyline points="6 9 12 15 18 9"></polyline></svg>;

    // --- СТИЛИ (Строгий Enterprise) ---
    const navStyle = {
        background: '#003366', // Темно-синий
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '0 40px',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    };

    const logoStyle = {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#fff',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '0.5px'
    };

    const logoIcon = {
        width: '32px', height: '32px', 
        background: 'rgba(255,255,255,0.15)', 
        borderRadius: '4px', 
        color: 'white', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: '14px', fontWeight: '900',
        border: '1px solid rgba(255,255,255,0.2)'
    };

    const linkStyle = (path) => ({
        margin: '0 15px',
        textDecoration: 'none',
        color: location.pathname === path ? '#fff' : 'rgba(255,255,255,0.7)',
        fontWeight: location.pathname === path ? 'bold' : '500',
        fontSize: '14px',
        transition: 'color 0.2s',
        borderBottom: location.pathname === path ? '2px solid #fff' : '2px solid transparent',
        paddingBottom: '4px'
    });

    const btnLogin = {
        background: 'transparent',
        color: '#fff',
        padding: '6px 16px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        marginLeft: '10px',
        border: '1px solid rgba(255,255,255,0.4)',
        transition: 'all 0.2s'
    };

    const btnRegister = {
        background: '#fff',
        color: '#003366',
        padding: '6px 16px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        marginLeft: '10px',
        border: '1px solid #fff'
    };

    const userBtnStyle = {
        color: '#fff',
        fontWeight: '500',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: '4px',
        background: showDropdown ? 'rgba(0,0,0,0.2)' : 'transparent',
        transition: 'background 0.2s'
    };

    const dropdownStyle = {
        position: 'absolute',
        top: '110%', 
        right: 0,
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        minWidth: '200px',
        overflow: 'hidden',
        display: showDropdown ? 'block' : 'none',
        zIndex: 1001,
        border: '1px solid #e0e0e0'
    };

    const dropdownItemStyle = {
        display: 'block',
        padding: '12px 20px',
        textDecoration: 'none',
        color: '#333',
        borderBottom: '1px solid #f1f3f5',
        transition: 'background 0.2s',
        cursor: 'pointer',
        background: 'white',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '14px',
        display: 'flex', alignItems: 'center'
    };

    return (
        <nav style={navStyle}>
            {/* Логотип */}
            <Link to="/" style={logoStyle}>
                <div style={logoIcon}>IT</div>
                <span>Conf.SSTU</span>
            </Link>

            {/* Меню */}
            <div className="nav-links">
                <Link to="/" style={linkStyle('/')}>Главная</Link>
                <Link to="/schedule" style={linkStyle('/schedule')}>Программа</Link>
                <Link to="/submissions" style={linkStyle('/submissions')}>Доклады</Link>
                
                {/* [ИЗМЕНЕНО] Убрал "О конференции", добавил "Новости" */}
                <Link to="/news" style={linkStyle('/news')}>Новости</Link>
                
                <Link to="/archive" style={linkStyle('/archive')}>Архив</Link> 
                <Link to="/contacts" style={linkStyle('/contacts')}>Контакты</Link>
            </div>

            {/* Правая часть */}
            <div style={{ position: 'relative' }}> 
                {isAuthenticated ? (
                    <div style={{ position: 'relative' }}>
                        {/* Кнопка с именем */}
                        <div 
                            style={userBtnStyle} 
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div style={{width:'28px', height:'28px', background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', marginRight:'10px'}}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            {userName} <IconChevron />
                        </div>

                        {/* Выпадающий список */}
                        {showDropdown && (
                            <>
                                <div 
                                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, cursor: 'default' }} 
                                    onClick={() => setShowDropdown(false)}
                                />
                                
                                <div style={dropdownStyle}>
                                    <Link 
                                        to="/dashboard" 
                                        style={dropdownItemStyle}
                                        onClick={() => setShowDropdown(false)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <IconUser /> Личный кабинет
                                    </Link>
                                    
                                    <button 
                                        onClick={handleLogout}
                                        style={{...dropdownItemStyle, color: '#e03131', borderBottom: 'none'}}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <IconLogout /> Выйти
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <Link to="/login" style={btnLogin}>Войти</Link>
                        <Link to="/register" style={btnRegister}>Регистрация</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
