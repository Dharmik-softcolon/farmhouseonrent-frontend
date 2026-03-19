import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import FarmhouseCard from '../components/FarmhouseCard';
import Spinner from '../components/Spinner';
import { Helmet } from 'react-helmet-async';
import {
    FiSearch, FiMapPin, FiUsers, FiHome, FiArrowRight,
    FiStar, FiChevronDown
} from 'react-icons/fi';

import posterImage from '../assets/image/poster.jpg';

const Home = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [farmhouses, setFarmhouses] = useState([]);
    const [totalFarmhouses, setTotalFarmhouses] = useState(0);
    const [cities, setCities] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('Surat');
    const [selectedSubLocation, setSelectedSubLocation] = useState('');
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
            setTotalFarmhouses(fhRes.data.pagination?.total || 0);
            setCities(cityRes.data.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch sub-locations when selected city is Surat
    useEffect(() => {
        if (selectedCity.toLowerCase() === 'surat') {
            farmhouseAPI.getSubLocations('Surat')
                .then(res => setSubLocations(res.data.data || []))
                .catch(() => setSubLocations([]));
        } else {
            setSubLocations([]);
            setSelectedSubLocation('');
        }
    }, [selectedCity]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedCity) params.set('city', selectedCity);
        if (selectedCity.toLowerCase() === 'surat' && selectedSubLocation) {
            params.set('subLocation', selectedSubLocation);
        }
        navigate(`/farmhouses?${params.toString()}`);
    };

    // Parallax values
    const heroOpacity = Math.max(0, 1 - scrollY / 600);
    const heroScale = 1 + scrollY * 0.0003;
    const contentTranslate = Math.min(0, -scrollY * 0.1);

    return (
        <>
            <Helmet>
                <title>Farmhouse on Rent in Surat | Book Best Farmhouses</title>
                <meta
                    name="description"
                    content="Find and book the best farmhouse in Surat for parties, weekend stays and events. 25+ premium farmhouses available."
                />
            </Helmet>

            <div className="animate-fade-in">
            {/* ══════════════════════════════════════════
          STICKY HERO — FIXED BACKGROUND
         ══════════════════════════════════════════ */}
            <div ref={heroRef} className="relative h-[60vh] sm:h-[60vh] lg:h-[65vh]">
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
                  {totalFarmhouses}+ Premium Farmhouses Available
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
                                {/* Mobile: fully stacked card */}
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden max-w-xl lg:max-w-2xl">
                                    {/* Row 1: City + (optional) sub-location */}
                                    <div className="flex items-center border-b border-gray-100">
                                        <div className="flex items-center gap-2 px-4 py-3 flex-1 border-r border-gray-100">
                                            <FiMapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                            <select
                                                value={selectedCity}
                                                onChange={e => { setSelectedCity(e.target.value); setSelectedSubLocation(''); }}
                                                className="bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer w-full"
                                            >
                                                <option value="">{t('filter_all_cities')}</option>
                                                {cities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Sub-location (Surat only) */}
                                        {selectedCity.toLowerCase() === 'surat' && subLocations.length > 0 && (
                                            <div className="flex items-center gap-2 px-4 py-3 flex-1">
                                                <select
                                                    value={selectedSubLocation}
                                                    onChange={e => setSelectedSubLocation(e.target.value)}
                                                    className="bg-transparent outline-none text-gray-700 text-sm font-medium cursor-pointer w-full"
                                                >
                                                    <option value="">All areas</option>
                                                    {subLocations.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    {/* Row 2: Search input + button */}
                                    <div className="flex items-center">
                                        <div className="flex items-center flex-1 gap-2 px-4 py-3">
                                            <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder={t('hero_search_placeholder')}
                                                className="w-full outline-none text-gray-800 text-sm placeholder:text-gray-400 bg-transparent"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-5
                                             transition-all duration-200 flex items-center gap-2
                                             shadow-none active:scale-[0.98] flex-shrink-0 text-sm"
                                        >
                                            <FiSearch className="w-4 h-4" />
                                            <span className="hidden sm:inline">{t('hero_search_btn')}</span>
                                        </button>
                                    </div>
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
                                    { icon: FiHome, value: `${totalFarmhouses}+`, label: t('hero_stats_farmhouses') },
                                    { icon: FiMapPin, value: `${cities.length}+`, label: t('hero_stats_cities') },
                                    { icon: FiUsers, value: '25+', label: t('hero_stats_guests') },
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

                {/* ── TRUST BADGE MARQUEE ── */}
                <section className="bg-white rounded-t-[2rem] sm:rounded-t-[2.5rem] border-b border-gray-100 overflow-hidden">
                    {/* Fade-edge masks */}
                    <div className="relative" style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    }}>
                        <div className="animate-marquee py-5 gap-0" style={{ width: 'max-content' }}>
                            {[
                                {
                                    bg: 'bg-emerald-50', iconBg: 'bg-emerald-500',
                                    label: 'Verified Properties', sub: 'Every listing quality-checked',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-amber-50', iconBg: 'bg-amber-500',
                                    label: 'Best Price Guaranteed', sub: 'No hidden charges ever',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-green-50', iconBg: 'bg-green-500',
                                    label: 'Instant WhatsApp Booking', sub: 'Connect in seconds',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.324-2.234l-.377-.306-2.655.89.89-2.655-.306-.377A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-blue-50', iconBg: 'bg-blue-500',
                                    label: '100% Safe & Secure', sub: 'Your privacy is protected',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-purple-50', iconBg: 'bg-purple-500',
                                    label: `${totalFarmhouses}+ Premium Farms`, sub: 'Across Gujarat & Surat',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-rose-50', iconBg: 'bg-rose-500',
                                    label: 'Flexible Schedule Update', sub: 'Flexible booking policy',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                    )
                                },
                                // ── Duplicate for seamless loop ──
                                {
                                    bg: 'bg-emerald-50', iconBg: 'bg-emerald-500',
                                    label: 'Verified Properties', sub: 'Every listing quality-checked',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-amber-50', iconBg: 'bg-amber-500',
                                    label: 'Best Price Guaranteed', sub: 'No hidden charges ever',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-green-50', iconBg: 'bg-green-500',
                                    label: 'Instant WhatsApp Booking', sub: 'Connect in seconds',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.324-2.234l-.377-.306-2.655.89.89-2.655-.306-.377A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-blue-50', iconBg: 'bg-blue-500',
                                    label: '100% Safe & Secure', sub: 'Your privacy is protected',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-purple-50', iconBg: 'bg-purple-500',
                                    label: `${totalFarmhouses}+ Premium Farms`, sub: 'Across Gujarat & Surat',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    )
                                },
                                {
                                    bg: 'bg-rose-50', iconBg: 'bg-rose-500',
                                    label: 'Free Cancellation', sub: 'Flexible booking policy',
                                    icon: (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                    )
                                },
                            ].map((badge, i) => (
                                <div key={i} className={`inline-flex items-center gap-3 mx-4 px-5 py-3 rounded-2xl border border-gray-100 ${badge.bg} flex-shrink-0`}>
                                    {/* Icon circle */}
                                    <div className={`w-9 h-9 rounded-xl ${badge.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        {badge.icon}
                                    </div>
                                    {/* Text */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight whitespace-nowrap">{badge.label}</p>
                                        <p className="text-[11px] text-gray-500 leading-tight whitespace-nowrap">{badge.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ── POPULAR CITIES ── */}
                {cities.length > 0 && (
                    <section className="py-8 sm:py-10">
                        <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {t('filter_city')}
                            </h2>
                        </div>

                        {/* Mobile: horizontal scroll pills | Desktop: grid */}
                        <div className="sm:hidden flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
                            {cities.map(city => (
                                <button
                                    key={city}
                                    onClick={() => navigate(`/farmhouses?city=${encodeURIComponent(city)}`)}
                                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                                        flex items-center justify-center shadow-md active:scale-95 transition-transform">
                                        <FiMapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 text-center whitespace-nowrap">{city}</span>
                                </button>
                            ))}
                        </div>

                        {/* Desktop grid */}
                        <div className="hidden sm:grid max-w-7xl mx-auto px-6 lg:px-8 grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                    Featured Farmhouses
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
                                {/* Mobile: horizontal snap carousel */}
                                <div className="sm:hidden -mx-4 px-4">
                                    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-scroll-x pb-2">
                                        {farmhouses.map(fh => (
                                            <div key={fh._id} className="flex-shrink-0 w-[73vw] snap-start">
                                                <FarmhouseCard farmhouse={fh} compact={true} />
                                            </div>
                                        ))}
                                        {/* See all card */}
                                        <div className="flex-shrink-0 w-[40vw] snap-start">
                                            <button
                                                onClick={() => navigate('/farmhouses')}
                                                className="h-full min-h-[200px] w-full rounded-2xl border-2 border-dashed border-primary-200
                                                    flex flex-col items-center justify-center gap-2 text-primary-600
                                                    bg-primary-50 active:bg-primary-100 transition-colors"
                                            >
                                                <FiArrowRight className="w-7 h-7" />
                                                <span className="text-sm font-semibold text-center px-2">View All</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop: grid layout */}
                                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {farmhouses.map(fh => (
                                        <FarmhouseCard key={fh._id} farmhouse={fh} />
                                    ))}
                                </div>
                                <div className="hidden sm:flex mt-6 justify-center">
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

                {/* ── CUSTOMER REVIEWS ── */}
                <section className="bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 sm:py-14">
                        <div className="text-center mb-8">
                            <span className="inline-block bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                                Guest Testimonials
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                What Our Guests Say
                            </h2>
                            <p className="text-gray-500 text-sm max-w-xl mx-auto">
                                Real experiences from real guests who made unforgettable memories
                            </p>
                        </div>

                        {(() => {
                            const reviews = [
                                {
                                    name: 'Raj Timbadiya',
                                    location: 'Surat',
                                    avatar: 'RT',
                                    rating: 5,
                                    date: 'July 2025',
                                    review: 'Found this farmhouse for our corporate team outing. The team had a blast! Great amenities, fast response on WhatsApp, and the pricing was well within budget. A truly seamless experience from start to finish.',
                                    tag: 'Corporate Outing'
                                },
                                {
                                    name: 'Mitesh Dholakiya',
                                    location: 'Surat',
                                    avatar: 'MD',
                                    rating: 4,
                                    date: 'January 2026',
                                    review: 'Very good farmhouse overall. The kids had a great time in the pool and open grounds. Booking was easy and the property manager was responsive. Small suggestion — a BBQ setup would make it even better!',
                                    tag: 'Family Trip'
                                },
                                {
                                    name: 'Kushik Khunt',
                                    location: 'Surat',
                                    avatar: 'KK',
                                    rating: 5,
                                    date: 'February 2024',
                                    review: 'This was our second booking through FarmHouseOnRent and it was just as amazing. Love how they verify each property — you know exactly what to expect. The photos matched perfectly. FarmHouseOnRent is our go-to for every getaway!',
                                    tag: 'Weekend Escape'
                                },
                            ];
                            const ReviewCard = ({ review }) => (
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 h-full">
                                    {/* Stars + tag */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, s) => (
                                            <FiStar
                                                key={s}
                                                className={`w-4 h-4 ${s < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                style={{ fill: s < review.rating ? '#facc15' : 'none' }}
                                            />
                                        ))}
                                        <span className="ml-auto text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {review.tag}
                                        </span>
                                    </div>
                                    {/* Review text — clamped to 4 lines */}
                                    <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-4">
                                        "{review.review}"
                                    </p>
                                    {/* Author */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                                                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {review.avatar}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{review.name}</p>
                                            <p className="text-xs text-gray-400">{review.location} · {review.date}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                            return (
                                <>
                                    {/* Mobile: horizontal snap carousel */}
                                    <div className="sm:hidden -mx-4 px-4">
                                        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-scroll-x pb-2">
                                            {reviews.map((review, i) => (
                                                <div key={i} className="flex-shrink-0 w-[80vw] snap-start">
                                                    <ReviewCard review={review} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Scroll hint dots */}
                                        <div className="flex justify-center gap-1.5 mt-3">
                                            {reviews.map((_, i) => (
                                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Desktop: 3-col grid */}
                                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {reviews.map((review, i) => (
                                            <ReviewCard key={i} review={review} />
                                        ))}
                                    </div>
                                </>
                            );
                        })()}

                        {/* Bottom Rating Summary — always 1 row */}
                        <div className="mt-6 flex flex-row items-center justify-around gap-2 bg-white rounded-2xl py-4 px-3 border border-gray-100 shadow-sm">
                            <div className="text-center flex-1">
                                <p className="text-2xl sm:text-4xl font-extrabold text-gray-900">4.9</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">Avg Rating</p>
                            </div>
                            <div className="w-px h-10 bg-gray-100" />
                            <div className="text-center flex-1">
                                <p className="text-2xl sm:text-4xl font-extrabold text-gray-900">25+</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">Happy Guests</p>
                            </div>
                            <div className="w-px h-10 bg-gray-100" />
                            <div className="text-center flex-1">
                                <p className="text-2xl sm:text-4xl font-extrabold text-gray-900">98%</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">Recommend</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ── */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img src={posterImage} alt="CTA Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
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
                                href="https://wa.me/916356079603?text=Hi! I'm looking for a farmhouse to book."
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
            </>
    );
};

export default Home;