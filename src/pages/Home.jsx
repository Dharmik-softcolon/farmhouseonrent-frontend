import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import FarmhouseCard from '../components/FarmhouseCard';
import Spinner from '../components/Spinner';
import {
    FiSearch, FiMapPin, FiUsers, FiHome, FiArrowRight,
    FiStar, FiShield, FiDollarSign, FiSmartphone, FiChevronDown
} from 'react-icons/fi';

import posterImage from '../assets/image/poster.jpg';

const Home = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [farmhouses, setFarmhouses] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef(null);

    useEffect(() => {
        loadData();

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const loadData = async () => {
        try {
            const [fhRes, cityRes] = await Promise.all([
                farmhouseAPI.getAll({ limit: 6, sort: 'newest' }),
                farmhouseAPI.getCities()
            ]);
            setFarmhouses(fhRes.data.data || []);
            setCities(cityRes.data.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedCity) params.set('city', selectedCity);
        navigate(`/farmhouses?${params.toString()}`);
    };

    // Parallax values
    const heroOpacity = Math.max(0, 1 - scrollY / 600);
    const heroScale = 1 + scrollY * 0.0003;
    const contentTranslate = Math.min(0, -scrollY * 0.1);

    return (
        <div className="animate-fade-in">
            {/* ══════════════════════════════════════════
          STICKY HERO — FIXED BACKGROUND
         ══════════════════════════════════════════ */}
            <div ref={heroRef} className="relative h-[55vh] sm:h-[60vh] lg:h-[65vh]">
                {/* Fixed Background Layer */}
                <div className="fixed top-0 left-0 right-0 h-[65vh] sm:h-[70vh] lg:h-[75vh] -z-10 overflow-hidden">
                    {/* Background Image with Parallax Scale */}
                    <div
                        className="absolute inset-0 transition-transform duration-100 will-change-transform"
                        style={{ transform: `scale(${heroScale})` }}
                    >
                        <img
                            src={posterImage}
                            alt="Farmhouse Hero"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

                    {/* Decorative Blurs */}
                    <div className="absolute top-10 right-10 w-52 h-52 bg-primary-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />

                    {/* Fade out on scroll */}
                    <div
                        className="absolute inset-0 bg-gray-50 transition-opacity duration-100"
                        style={{ opacity: 1 - heroOpacity }}
                    />
                </div>

                {/* Hero Content — Fades + moves on scroll */}
                <div
                    className="relative z-10 h-full flex items-center transition-all duration-100 will-change-transform"
                    style={{
                        opacity: heroOpacity,
                        transform: `translateY(${contentTranslate}px)`
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-2xl lg:max-w-3xl">
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20
                            rounded-full px-4 py-1.5 mb-4 animate-slide-up">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white/90 text-xs sm:text-sm font-medium">
                  {farmhouses.length}+ Premium Farmhouses Available
                </span>
                            </div>

                            {/* Heading */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-3 sm:mb-4">
                                {t('hero_title')}{' '}
                                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                    {t('hero_title_highlight')}
                  </span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 10" fill="none">
                    <path d="M2 8C60 2 120 2 180 5C240 8 270 4 298 6" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
                            </h1>

                            <p className="text-sm sm:text-base lg:text-lg text-white/75 mb-5 max-w-xl leading-relaxed">
                                {t('hero_subtitle')}
                            </p>

                            {/* ── SEARCH BAR ── */}
                            <form onSubmit={handleSearch} className="mb-5">
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-1.5 sm:p-2
                              flex flex-col sm:flex-row gap-1.5 sm:gap-0 max-w-xl lg:max-w-2xl">
                                    {/* City */}
                                    <div className="flex items-center gap-2 px-3 sm:border-r border-gray-200 flex-shrink-0">
                                        <FiMapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                        <select
                                            value={selectedCity}
                                            onChange={e => setSelectedCity(e.target.value)}
                                            className="bg-transparent py-2.5 sm:py-2 outline-none text-gray-700 text-sm font-medium
                               cursor-pointer min-w-[100px] sm:min-w-[120px]"
                                        >
                                            <option value="">{t('filter_all_cities')}</option>
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Search Input */}
                                    <div className="flex items-center flex-1 gap-2 px-3">
                                        <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder={t('hero_search_placeholder')}
                                            className="w-full py-2.5 sm:py-2 outline-none text-gray-800 text-sm placeholder:text-gray-400"
                                        />
                                    </div>

                                    {/* Button */}
                                    <button
                                        type="submit"
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5
                             rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                             shadow-lg shadow-primary-600/30 hover:shadow-xl active:scale-[0.98] flex-shrink-0 text-sm"
                                    >
                                        <FiSearch className="w-4 h-4" />
                                        <span>{t('hero_search_btn')}</span>
                                    </button>
                                </div>
                            </form>

                            {/* Quick City Pills */}
                            {cities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-white/50 text-xs self-center mr-1">Popular:</span>
                                    {cities.slice(0, 4).map(city => (
                                        <button
                                            key={city}
                                            onClick={() => navigate(`/farmhouses?city=${encodeURIComponent(city)}`)}
                                            className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm
                               border border-white/20 text-white hover:bg-white/20 transition-all"
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Stats Row */}
                            <div className="flex items-center gap-5 sm:gap-8">
                                {[
                                    { icon: FiHome, value: `${farmhouses.length}+`, label: t('hero_stats_farmhouses') },
                                    { icon: FiMapPin, value: `${cities.length}+`, label: t('hero_stats_cities') },
                                    { icon: FiUsers, value: '500+', label: t('hero_stats_guests') },
                                    { icon: FiStar, value: '4.8', label: 'Rating' },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <stat.icon className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
                                        <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                                        <p className="text-[10px] text-white/50 font-medium">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300"
                    style={{ opacity: heroOpacity }}
                >
                    <div className="flex flex-col items-center gap-1 animate-bounce">
                        <span className="text-white/50 text-[10px] font-medium tracking-wider uppercase">Scroll</span>
                        <FiChevronDown className="w-5 h-5 text-white/50" />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          CONTENT OVERLAY — SCROLLS OVER HERO
         ══════════════════════════════════════════ */}
            <div className="relative z-20 bg-gray-50 rounded-t-[2rem] sm:rounded-t-[2.5rem] -mt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

                {/* ── TRUST BADGES ── */}
                <section className="bg-white rounded-t-[2rem] sm:rounded-t-[2.5rem] border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                            {[
                                { emoji: '✅', text: 'Verified Properties' },
                                { emoji: '💰', text: 'Best Price Guaranteed' },
                                { emoji: '📱', text: 'Instant WhatsApp Booking' },
                                { emoji: '🛡️', text: '100% Safe & Secure' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 justify-center text-xs sm:text-sm text-gray-600">
                                    <span className="text-base sm:text-lg">{item.emoji}</span>
                                    <span className="font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── POPULAR CITIES ── */}
                {cities.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                🏙️ {t('filter_city')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {cities.map(city => (
                                <button
                                    key={city}
                                    onClick={() => navigate(`/farmhouses?city=${encodeURIComponent(city)}`)}
                                    className="group relative overflow-hidden rounded-2xl h-24 sm:h-28"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800
                                group-hover:from-primary-700 group-hover:to-primary-900 transition-colors" />
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300')] bg-cover bg-center" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-3">
                                        <FiMapPin className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-sm text-center">{city}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── FEATURED FARMHOUSES ── */}
                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    🌟 Featured Farmhouses
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Handpicked properties for the perfect getaway
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/farmhouses')}
                                className="hidden sm:flex items-center gap-1 text-primary-600 hover:text-primary-700
                         text-sm font-semibold transition-colors bg-primary-50 px-4 py-2 rounded-xl
                         hover:bg-primary-100"
                            >
                                View All <FiArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {loading ? (
                            <Spinner text={t('common_loading')} />
                        ) : farmhouses.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                <span className="text-5xl block mb-4">🏡</span>
                                <p className="text-gray-500 text-lg">{t('common_no_results')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {farmhouses.map(fh => (
                                        <FarmhouseCard key={fh._id} farmhouse={fh} />
                                    ))}
                                </div>
                                <div className="sm:hidden mt-6 text-center">
                                    <button
                                        onClick={() => navigate('/farmhouses')}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        View All Farmhouses <FiArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="text-center mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                How It Works
                            </h2>
                            <p className="text-gray-500 text-sm max-w-xl mx-auto">
                                Book your dream farmhouse in 3 simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    step: '01',
                                    icon: <FiSearch className="w-7 h-7" />,
                                    title: 'Search & Explore',
                                    desc: 'Browse our curated collection of premium farmhouses. Filter by city, price, and facilities.',
                                    color: 'bg-blue-50 text-blue-600'
                                },
                                {
                                    step: '02',
                                    icon: <FiSmartphone className="w-7 h-7" />,
                                    title: 'Submit Inquiry',
                                    desc: 'Fill in your details and preferred date. Connect instantly via WhatsApp for quick confirmation.',
                                    color: 'bg-green-50 text-green-600'
                                },
                                {
                                    step: '03',
                                    icon: <FiHome className="w-7 h-7" />,
                                    title: 'Enjoy Your Stay',
                                    desc: 'Visit the farmhouse and create beautiful memories with your family and friends.',
                                    color: 'bg-purple-50 text-purple-600'
                                }
                            ].map((item, i) => (
                                <div key={i} className="relative text-center group">
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gray-200 z-0">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
                                        </div>
                                    )}
                                    <div className="relative z-10">
                                        <span className="inline-block text-xs font-bold text-gray-300 mb-2">STEP {item.step}</span>
                                        <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-3 
                                  group-hover:scale-110 transition-transform shadow-sm`}>
                                            {item.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                                        <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── WHY CHOOSE US ── */}
                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="text-center mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                ✨ Why Choose FarmStay?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                {
                                    emoji: '🏡',
                                    title: 'Verified Properties',
                                    desc: 'All farmhouses are personally verified for quality, safety, and hygiene.'
                                },
                                {
                                    emoji: '💰',
                                    title: 'Best Prices',
                                    desc: 'Transparent pricing with no hidden charges. Weekday discounts available.'
                                },
                                {
                                    emoji: '📱',
                                    title: 'Instant Booking',
                                    desc: 'Quick inquiry and instant WhatsApp confirmation. No waiting.'
                                },
                                {
                                    emoji: '⭐',
                                    title: 'Real Reviews',
                                    desc: 'Genuine reviews with photos from real guests who visited.'
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-50 text-center p-5 rounded-2xl border border-gray-100
                           hover:shadow-lg hover:border-primary-200 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center
                               mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">{item.emoji}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{item.title}</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ── */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img src={posterImage} alt="CTA Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
                        <h2 className="text-xl sm:text-3xl font-bold text-white mb-3">
                            Ready for an Unforgettable Getaway?
                        </h2>
                        <p className="text-white/80 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
                            Browse our collection of premium farmhouses and book your perfect retreat today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => navigate('/farmhouses')}
                                className="bg-white text-primary-700 font-bold py-2.5 px-6 rounded-xl
                         hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]
                         flex items-center gap-2 text-sm"
                            >
                                <FiSearch className="w-4 h-4" />
                                Explore Farmhouses
                            </button>
                            <a
                                href="https://wa.me/919876543210?text=Hi! I'm looking for a farmhouse to book."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white font-bold py-2.5 px-6 rounded-xl
                         hover:bg-green-600 transition-all shadow-xl active:scale-[0.98]
                         flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.324-2.234l-.377-.306-2.655.89.89-2.655-.306-.377A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                </svg>
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;