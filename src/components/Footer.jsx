import { Link } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import Logo from './Logo';
import { FiMail, FiPhone, FiInstagram, FiFacebook } from 'react-icons/fi';

const SITE_URL = 'https://farmhouseonrent.in';

const Footer = () => {
    const { t } = useLanguage();

    // ─── JSON-LD Organization schema in footer ───
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "FarmHouseOnRent",
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.svg`,
        "telephone": "+91-6356079603",
        "email": "dharmikg2208@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Surat",
            "addressRegion": "Gujarat",
            "addressCountry": "IN"
        },
        "sameAs": [
            "https://www.instagram.com/farmhouseonrents",
            "https://www.facebook.com/share/188d88LfjG"
        ]
    };

    return (
        <>
            {/* ─── Footer Schema ─── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />

            <footer className="bg-gray-900 text-gray-300 pb-20 md:pb-0">

                {/* ══════════════════════════════
                    DESKTOP FOOTER
                ══════════════════════════════ */}
                <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* ── Brand ── */}
                        <div className="lg:col-span-1">
                            <div className="mb-4">
                                <Logo size="md" white={true} />
                            </div>
                            <p className="text-sm leading-relaxed text-gray-400">
                                {t('footer_about_text')}
                            </p>
                            {/* ── Trust Signals ── */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                                    ✅ Verified Listings
                                </span>
                                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                                    🔒 Secure Booking
                                </span>
                            </div>
                        </div>

                        {/* ── Quick Links ── */}
                        <nav aria-label="Footer quick links">
                            <h3 className="text-white font-semibold mb-4">
                                {t('footer_quick_links')}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        to="/"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        {t('nav_home')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/farmhouses"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        {t('footer_all_farmhouses')}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/farmhouses?city=Surat"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        Farmhouses in Surat
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/farmhouses?city=Bharuch"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        Farmhouses in Bharuch
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/farmhouses?city=Navsari"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        Farmhouses in Navsari
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/login"
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        {t('nav_login')}
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* ── Contact ── */}
                        <address className="not-italic">
                            <h3 className="text-white font-semibold mb-4">
                                {t('footer_contact_us')}
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <FiMail
                                        className="w-4 h-4 text-primary-400 flex-shrink-0"
                                        aria-hidden="true"
                                    />
                                    <a
                                        href="mailto:dharmikg2208@gmail.com"
                                        className="hover:text-primary-400 transition-colors"
                                        aria-label="Email FarmHouseOnRent"
                                    >
                                        {t('footer_contact_email')}
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FiPhone
                                        className="w-4 h-4 text-primary-400 flex-shrink-0"
                                        aria-hidden="true"
                                    />
                                    <a
                                        href="tel:+916356079603"
                                        className="hover:text-primary-400 transition-colors"
                                        aria-label="Call FarmHouseOnRent"
                                    >
                                        {t('footer_contact_phone')}
                                    </a>
                                </li>
                                <li className="text-xs text-gray-500 mt-2">
                                    Surat, Gujarat, India
                                </li>
                            </ul>
                        </address>

                        {/* ── Social ── */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                {t('footer_follow')}
                            </h3>
                            <div className="flex gap-3">
                                {[
                                    {
                                        Icon: FiInstagram,
                                        href: 'https://www.instagram.com/farmhouseonrents?igsh=aDhkZmp3a2p5emt5',
                                        color: 'hover:bg-pink-600',
                                        label: 'Follow FarmHouseOnRent on Instagram'
                                    },
                                    {
                                        Icon: FiFacebook,
                                        href: 'https://www.facebook.com/share/188d88LfjG',
                                        color: 'hover:bg-blue-600',
                                        label: 'Follow FarmHouseOnRent on Facebook'
                                    },
                                ].map(({ Icon, href, color, label }, i) => (
                                    <a
                                        key={i}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className={`w-10 h-10 rounded-full bg-gray-800 flex items-center
                                            justify-center ${color} transition-colors`}
                                    >
                                        <Icon className="w-5 h-5" aria-hidden="true" />
                                    </a>
                                ))}
                            </div>

                            {/* ── Cities Served ── */}
                            <div className="mt-6">
                                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                                    Cities We Serve
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Surat', 'Bharuch', 'Navsari', 'Ahmedabad', 'Dang'].map(city => (
                                        <Link
                                            key={city}
                                            to={`/farmhouses?city=${city}`}
                                            className="text-[11px] bg-gray-800 text-gray-400 hover:text-primary-400
                                                hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
                                        >
                                            {city}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* App Download Placeholder */}
                            <div className="mt-5">
                                <p className="text-xs text-gray-500 mb-2">Coming Soon</p>
                                <div className="flex gap-2">
                                    <div className="bg-gray-800 rounded-lg px-3 py-2 text-[10px] text-gray-500">
                                        Google Play
                                    </div>
                                    <div className="bg-gray-800 rounded-lg px-3 py-2 text-[10px] text-gray-500">
                                        App Store
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Bar ── */}
                    <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row
                        items-center justify-between gap-2">
                        <p className="text-xs text-gray-500">{t('footer_rights')}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{t('footer_made_with')}</span>
                            <span>·</span>
                            <a
                                href="/sitemap.xml"
                                className="hover:text-gray-400 transition-colors"
                                aria-label="View sitemap"
                            >
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════
                    MOBILE FOOTER
                ══════════════════════════════ */}
                <div className="sm:hidden px-5 pt-8 pb-4">
                    <div className="mb-5">
                        <Logo size="md" white={true} />
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                            {t('footer_about_text')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        {/* Quick Links */}
                        <nav aria-label="Mobile footer quick links">
                            <h4 className="text-white font-semibold text-sm mb-2">
                                {t('footer_quick_links')}
                            </h4>
                            <ul className="space-y-1.5 text-xs">
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
                                    <Link to="/farmhouses?city=Surat" className="hover:text-primary-400 transition-colors">
                                        Surat Farmhouses
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Contact */}
                        <address className="not-italic">
                            <h4 className="text-white font-semibold text-sm mb-2">
                                {t('footer_contact_us')}
                            </h4>
                            <ul className="space-y-1.5 text-xs">
                                <li>
                                    <a
                                        href="mailto:dharmikg2208@gmail.com"
                                        className="hover:text-primary-400 transition-colors flex items-center gap-1"
                                        aria-label="Email us"
                                    >
                                        <FiMail className="w-3 h-3 text-primary-400" aria-hidden="true" />
                                        Mail us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="tel:+916356079603"
                                        className="hover:text-primary-400 transition-colors flex items-center gap-1"
                                        aria-label="Call us"
                                    >
                                        <FiPhone className="w-3 h-3 text-primary-400" aria-hidden="true" />
                                        Call us
                                    </a>
                                </li>
                            </ul>
                        </address>
                    </div>

                    {/* Social */}
                    <div className="flex gap-3 mb-5">
                        {[
                            {
                                Icon: FiInstagram,
                                href: 'https://www.instagram.com/farmhouseonrents?igsh=aDhkZmp3a2p5emt5',
                                color: 'hover:bg-pink-600',
                                label: 'Instagram'
                            },
                            {
                                Icon: FiFacebook,
                                href: 'https://www.facebook.com/share/188d88LfjG',
                                color: 'hover:bg-blue-600',
                                label: 'Facebook'
                            },
                        ].map(({ Icon, href, color, label }, i) => (
                            <a
                                key={i}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${label} - FarmHouseOnRent`}
                                className={`w-9 h-9 rounded-full bg-gray-800 flex items-center
                                    justify-center ${color} transition-colors`}
                            >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                            </a>
                        ))}
                    </div>

                    <div className="border-t border-gray-800 pt-4 flex flex-col gap-1 items-center">
                        <p className="text-[10px] text-gray-500 text-center">
                            {t('footer_rights')}
                        </p>
                        <a
                            href="/sitemap.xml"
                            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                        >
                            Sitemap
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;