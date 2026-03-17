import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import useLanguage from '../hooks/useLanguage';
import { FiMenu, FiX, FiHome, FiLogIn, FiLogOut, FiGrid, FiPlusCircle, FiUsers, FiStar, FiSearch } from 'react-icons/fi';

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

    // Hide bottom nav on admin pages
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <>
            {/* ── TOP NAVBAR ── */}
            <nav className="sticky top-0 z-50 glass-effect shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/">
                            <Logo size="md" />
                        </Link>

                        {/* Desktop Nav */}
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
                            ) : ( ""
                                // <NavLink to="/admin/login" icon={FiLogIn} label={t('nav_login')} />
                            )
                            }
                            <div className="ml-2 border-l pl-2 border-gray-200">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Mobile Top-right: Lang + Hamburger (admin only) */}
                        <div className="flex items-center gap-2 md:hidden">
                            <LanguageSwitcher />
                            {isAdminPage && (
                                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu (admin pages only) */}
                    {mobileOpen && isAdminPage && (
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
                            ) : ( ""
                                // <NavLink to="/admin/login" icon={FiLogIn} label={t('nav_login')} />
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* ── MOBILE BOTTOM NAV BAR ── */}
            {!isAdminPage && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 mobile-cta-shadow pb-safe">
                    <div className="flex items-stretch h-16">
                        {/* Home */}
                        <Link
                            to="/"
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                                ${isActive('/') ? 'text-primary-600' : 'text-gray-400 active:text-primary-600'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive('/') ? 'bg-primary-50' : ''}`}>
                                <FiHome className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide">Home</span>
                        </Link>

                        {/* Browse */}
                        <Link
                            to="/farmhouses"
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                                ${isActive('/farmhouses') ? 'text-primary-600' : 'text-gray-400 active:text-primary-600'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive('/farmhouses') ? 'bg-primary-50' : ''}`}>
                                <FiSearch className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide">Browse</span>
                        </Link>

                        {/* WhatsApp CTA — center accent button */}
                        <a
                            href="https://wa.me/916356079603?text=Hi! I'm looking for a farmhouse to book."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex flex-col items-center justify-center gap-0.5"
                        >
                            <div className="w-12 h-12 -mt-5 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/40 active:scale-95 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.324-2.234l-.377-.306-2.655.89.89-2.655-.306-.377A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide text-green-600">WhatsApp</span>
                        </a>

                        {/* Saved/Explore (optional tab slot) */}
                        <Link
                            to="/farmhouses"
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-primary-600 transition-colors"
                        >
                            <div className="p-1.5 rounded-xl">
                                <FiGrid className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide">Explore</span>
                        </Link>

                        {/* Login / Admin */}
                        <Link
                            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 active:text-primary-600 transition-colors"
                        >
                            <div className="p-1.5 rounded-xl">
                                {isAuthenticated ? <FiGrid className="w-5 h-5" /> : <FiLogIn className="w-5 h-5" />}
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide">{isAuthenticated ? 'Admin' : 'Login'}</span>
                        </Link>
                    </div>
                </nav>
            )}
        </>
    );
};

export default Navbar;