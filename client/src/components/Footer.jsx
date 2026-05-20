import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { language } = useLanguage();
    
    return (
        <footer style={{ 
            background: '#343a40', 
            color: '#adb5bd', 
            padding: '40px 20px', 
            textAlign: 'center', 
            fontSize: '14px',
            marginTop: 'auto' // Чтобы футер прижимался к низу, если контента мало
        }}>
            <p style={{ margin: 0 }}>
                {language === 'ru' 
                    ? '© 2025 Саратовский государственный технический университет имени Гагарина Ю.А.'
                    : '© 2025 Saratov State Technical University named after Gagarin Yu.A.'}
            </p>
        </footer>
    );
};

export default Footer;
