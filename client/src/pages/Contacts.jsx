import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contacts = () => {
    // --- SVG ИКОНКИ ---
    const IconMapPin = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    const IconPhone = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
    const IconMail = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

    // --- СТИЛИ ---
    const styles = {
        page: {
            background: '#f8f9fa',
            minHeight: '100vh',
            fontFamily: '"Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            background: 'white',
            padding: '12px 20px',   // <--- БЫЛО 40px, СТАЛО 25px (Меньше высота)
            textAlign: 'center',
            borderBottom: '1px solid #e9ecef',
            marginBottom: '30px'
        },
        title: {
            margin: 0,
            fontSize: '28px',       // <--- Чуть уменьшил шрифт (было 32px), чтобы смотрелось гармоничнее
            fontWeight: '700',
            color: '#343a40'
        },
        subtitle: {
            marginTop: '8px',
            color: '#6c757d',
            fontSize: '16px'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto 60px',
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '30px',
            alignItems: 'start',
            width: '100%',
            flex: 1
        },
        infoColumn: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px'
        },
        iconBox: {
            minWidth: '50px',
            height: '50px',
            borderRadius: '12px',
            background: '#e7f1ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        cardContent: {
            flex: 1
        },
        cardTitle: {
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: '#868e96',
            letterSpacing: '0.5px'
        },
        cardText: {
            margin: 0,
            fontSize: '16px',
            color: '#212529',
            fontWeight: '500',
            lineHeight: '1.5'
        },
        mapWrapper: {
            background: 'white',
            padding: '10px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            height: '600px'
        },
        iframe: {
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            border: 'none'
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            
            <div style={styles.header}>
                <h1 style={styles.title}>Свяжитесь с нами</h1>
                <p style={styles.subtitle}>Мы ответим на все вопросы по организации и проведению конференции</p>
            </div>
            
            <div style={styles.container}>
                {/* ЛЕВАЯ КОЛОНКА: ИНФОРМАЦИЯ */}
                <div style={styles.infoColumn}>
                    
                    {/* Адрес */}
                    <div style={styles.card}>
                        <div style={styles.iconBox}><IconMapPin /></div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>Место проведения</h3>
                            <p style={styles.cardText}>
                                СГТУ имени Гагарина Ю.А.<br/>
                                г. Саратов, ул. Политехническая, 77<br/>
                                <span style={{color: '#666', fontSize: '14px'}}>5 корпус</span>
                            </p>
                        </div>
                    </div>

                    {/* Телефон */}
                    <div style={styles.card}>
                        <div style={styles.iconBox}><IconPhone /></div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>Телефоны</h3>
                            <p style={styles.cardText}>
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    <div style={styles.card}>
                        <div style={styles.iconBox}><IconMail /></div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>Электронная почта</h3>
                            <p style={styles.cardText}>
                            </p>
                        </div>
                    </div>

                    {/* Секретарь */}
                    <div style={styles.card}>
                        <div style={styles.iconBox}><IconUser /></div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>Ответственный секретарь</h3>
                            <p style={styles.cardText}>
                            </p>
                        </div>
                    </div>

                </div>

                {/* ПРАВАЯ КОЛОНКА: КАРТА */}
                <div style={styles.mapWrapper}>
                    <iframe 
                        src="https://yandex.ru/map-widget/v1/?um=constructor%3Ad3346780f7eb523554bcfc032aaa55f371e42dfda6cb5b87148311e3a4bd9f84&amp;source=constructor" 
                        style={styles.iframe}
                        title="Карта СГТУ"
                    ></iframe>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contacts;
