import React, { createContext, useState, useContext } from 'react';
import { translations } from '../translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Получаем язык из localStorage или по умолчанию 'ru'
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ru');

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('lang', lang);
    };

    const t = (key) => {
        const keys = key.split('.');
        let result = translations[language];
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key; // если перевод не найден, возвращаем ключ
            }
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
