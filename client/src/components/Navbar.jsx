import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("");
    const [showDropdown, setShowDropdown] = useState(false); 
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
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
                        fetchUnreadCount();
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

    // Подсчёт непрочитанных
    const fetchUnreadCount = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
                headers: { token: localStorage.token }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Загрузить уведомления
    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/notifications/", {
                headers: { token: localStorage.token }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Пометить прочитанными
    const markAllRead = async () => {
        try {
            await fetch("http://localhost:5000/api/notifications/mark-read", {
                method: "PUT",
                headers: { token: localStorage.token }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    // Открыть колокольчик
    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
    };

    // Периодическая проверка (каждые 30 сек)
    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUserName("");
        setShowDropdown(false);
        setShowNotifications(false);
        navigate("/"); 
        window.location.reload(); 
    };

    // --- SVG ИКОНКИ ---
    const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8, verticalAlign:'text-bottom'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8, verticalAlign:'text-bottom'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
    const IconChevron = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:6}}><polyline points="6 9 12 15 18 9"></polyline></svg>;
    const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

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
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        textDecoration: 'none',
        color: '#333',
        transition: 'background 0.2s',
        cursor: 'pointer',
        background: 'white',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '14px'
    };

    // Стили колокольчика
    const bellBtnStyle = {
        position: 'relative',
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        padding: '6px',
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background 0.2s'
    };

    const badgeStyle = {
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        background: '#e53935',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        minWidth: '16px',
        height: '16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        padding: '0 4px',
        boxSizing: 'border-box'
    };

    const notifPanelStyle = {
        position: 'absolute',
        top: '110%',
        right: 0,
        width: '360px',
        maxHeight: '420px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid #e0e0e0',
        zIndex: 1002,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    };

    const notifHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafbfc'
    };

    const notifItemStyle = (isRead) => ({
        padding: '14px 18px',
        borderBottom: '1px solid #f5f5f5',
        background: isRead ? '#fff' : '#eef4ff',
        cursor: 'default',
        transition: 'background 0.2s'
    });

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'только что';
        if (diffMin < 60) return `${diffMin} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return d.toLocaleDateString('ru-RU');
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}> 
                {isAuthenticated ? (
                    <>
                        {/* Колокольчик */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                style={bellBtnStyle}
                                onClick={toggleNotifications}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                title="Уведомления"
                            >
                                <IconBell />
                                {unreadCount > 0 && (
                                    <span style={badgeStyle}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Панель уведомлений */}
                            {showNotifications && (
                                <>
                                    <div 
                                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1001, cursor: 'default' }} 
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <div style={notifPanelStyle}>
                                        <div style={notifHeaderStyle}>
                                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#202124' }}>
                                                Уведомления
                                            </span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllRead}
                                                    style={{
                                                        background: 'none', border: 'none', color: '#0056b3',
                                                        fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                                                    }}
                                                >
                                                    Прочитать все
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ overflowY: 'auto', flex: 1 }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                                                    <p style={{ margin: 0, fontSize: '14px' }}>Нет уведомлений</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif.id} 
                                                        style={notifItemStyle(notif.is_read)}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read ? '#fff' : '#eef4ff'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                            <span style={{ fontSize: '20px', flexShrink: 0 }}>
                                                                {notif.message.includes('принят') ? '✅' : notif.message.includes('Назначено') ? '📅' : '❌'}
                                                            </span>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ 
                                                                    margin: '0 0 4px', fontSize: '13px', 
                                                                    color: '#333', lineHeight: '1.4',
                                                                    fontWeight: notif.is_read ? '400' : '600'
                                                                }}>
                                                                    {notif.message}
                                                                </p>
                                                                <span style={{ fontSize: '11px', color: '#999' }}>
                                                                    {formatDate(notif.created_at)}
                                                                </span>
                                                            </div>
                                                            {!notif.is_read && (
                                                                <div style={{
                                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                                    background: '#0056b3', flexShrink: 0, marginTop: '4px'
                                                                }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Профиль */}
                        <div style={{ position: 'relative' }}>
                            {/* Кнопка с именем */}
                            <div 
                                style={userBtnStyle} 
                                onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
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
                    </>
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
