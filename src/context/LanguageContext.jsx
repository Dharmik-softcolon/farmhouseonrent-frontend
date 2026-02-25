import { createContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('farmstay_lang') || 'en';
    });

    const changeLanguage = useCallback((lang) => {
        setLanguage(lang);
        localStorage.setItem('farmstay_lang', lang);
    }, []);

    const t = useCallback((key) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    }, [language]);

    const getFacilityLabel = useCallback((facility) => {
        const key = `facility_${facility}`;
        return t(key);
    }, [t]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, getFacilityLabel }}>
            {children}
        </LanguageContext.Provider>
    );
};