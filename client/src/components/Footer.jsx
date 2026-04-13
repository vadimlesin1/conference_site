import React from 'react';

const Footer = () => {
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
                © 2025 Саратовский государственный технический университет имени Гагарина Ю.А.
            </p>
        </footer>
    );
};

export default Footer;
