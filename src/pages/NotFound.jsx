import { Link } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';

const NotFound = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            <span className="text-8xl mb-4">🏚️</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('notfound_title')}</h2>
            <p className="text-gray-500 mb-6 max-w-md">{t('notfound_text')}</p>
            <Link to="/" className="btn-primary">{t('notfound_home')}</Link>
        </div>
    );
};

export default NotFound;