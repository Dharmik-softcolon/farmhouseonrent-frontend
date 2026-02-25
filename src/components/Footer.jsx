import { Link } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import Logo from './Logo';
import { FiMail, FiPhone, FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="mb-4">
                            <Logo size="md" white={true} />
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            {t('footer_about_text')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t('footer_quick_links')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-primary-400 transition-colors">
                                    {t('nav_home')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/farmhouses" className="hover:text-primary-400 transition-colors">
                                    {t('footer_all_farmhouses')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/login" className="hover:text-primary-400 transition-colors">
                                    {t('nav_login')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t('footer_contact_us')}</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <a href="mailto:dharmikg2208@gmail.com" className="hover:text-primary-400 transition-colors">
                                    {t('footer_contact_email')}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <FiPhone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                <a href="tel:+916356079603" className="hover:text-primary-400 transition-colors">
                                    {t('footer_contact_phone')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t('footer_follow')}</h3>
                        <div className="flex gap-3">
                            {[
                                { Icon: FiInstagram, href: 'https://instagram.com', color: 'hover:bg-pink-600' },
                                { Icon: FiFacebook, href: 'https://facebook.com', color: 'hover:bg-blue-600' },
                                { Icon: FiTwitter, href: 'https://twitter.com', color: 'hover:bg-sky-500' },
                                { Icon: FiYoutube, href: 'https://youtube.com', color: 'hover:bg-red-600' },
                            ].map(({ Icon, href, color }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center 
                             ${color} transition-colors`}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>

                        {/* App Download Placeholder */}
                        <div className="mt-6">
                            <p className="text-xs text-gray-500 mb-2">Coming Soon</p>
                            <div className="flex gap-2">
                                <div className="bg-gray-800 rounded-lg px-3 py-2 text-[10px]">
                                    <span className="text-gray-500">▶</span> Google Play
                                </div>
                                <div className="bg-gray-800 rounded-lg px-3 py-2 text-[10px]">
                                    <span className="text-gray-500">🍎</span> App Store
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">{t('footer_rights')}</p>
                    <p className="text-xs text-gray-500">{t('footer_made_with')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;