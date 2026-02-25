import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import useLanguage from '../hooks/useLanguage';
import { FiMenu, FiX, FiHome, FiLogIn, FiLogOut, FiGrid, FiPlusCircle, FiUsers, FiStar } from 'react-icons/fi';

const Navbar = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, label, onClick }) => (
        <Link
            to={to}
            onClick={onClick || (() => setMobileOpen(false))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 glass-effect shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/">
                        <Logo size="md" />
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={FiHome} label={t('nav_home')} />
                        <NavLink to="/farmhouses" icon={FiGrid} label={t('nav_farmhouses')} />
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/admin/dashboard" icon={FiGrid} label={t('nav_dashboard')} />
                                <NavLink to="/admin/add-farmhouse" icon={FiPlusCircle} label={t('nav_add_farmhouse')} />
                                <NavLink to="/admin/bookings" icon={FiUsers} label={t('nav_bookings')} />
                                <NavLink to="/admin/reviews" icon={FiStar} label="Reviews" />
                                <button onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                    <FiLogOut className="w-4 h-4" /> {t('nav_logout')}
                                </button>
                            </>
                        ) : (
                            <NavLink to="/admin/login" icon={FiLogIn} label={t('nav_login')} />
                        )}
                        <div className="ml-2 border-l pl-2 border-gray-200">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSwitcher />
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 pt-2 space-y-1 animate-slide-up border-t border-gray-100">
                        <NavLink to="/" icon={FiHome} label={t('nav_home')} />
                        <NavLink to="/farmhouses" icon={FiGrid} label={t('nav_farmhouses')} />
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/admin/dashboard" icon={FiGrid} label={t('nav_dashboard')} />
                                <NavLink to="/admin/add-farmhouse" icon={FiPlusCircle} label={t('nav_add_farmhouse')} />
                                <NavLink to="/admin/bookings" icon={FiUsers} label={t('nav_bookings')} />
                                <NavLink to="/admin/reviews" icon={FiStar} label="Reviews" />
                                <button onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                    <FiLogOut className="w-4 h-4" /> {t('nav_logout')}
                                </button>
                            </>
                        ) : (
                            <NavLink to="/admin/login" icon={FiLogIn} label={t('nav_login')} />
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;