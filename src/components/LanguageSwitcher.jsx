import { useState, useRef, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { FiGlobe } from 'react-icons/fi';

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
];

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const current = languages.find((l) => l.code === language);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100
                   transition-colors text-sm font-medium text-gray-700"
            >
                <FiGlobe className="w-4 h-4" />
                <span className="hidden sm:inline">{current?.flag} {current?.label}</span>
                <span className="sm:hidden">{current?.flag}</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100
                        py-1 z-50 animate-fade-in">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                changeLanguage(lang.code);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 
                         transition-colors ${language === lang.code ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'}`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-primary-600">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;