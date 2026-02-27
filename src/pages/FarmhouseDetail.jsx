import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { farmhouseAPI } from '../services/api';
import ImageGallery from '../components/ImageGallery';
import BookingForm from '../components/BookingForm';
import WhatsAppButton from '../components/WhatsAppButton';
import FarmhouseCard from '../components/FarmhouseCard';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import ReviewPhotosGrid from '../components/ReviewPhotosGrid';
import { StarDisplay } from '../components/StarRating';
import Spinner from '../components/Spinner';
import {
    FiMapPin, FiUsers, FiPhone, FiExternalLink, FiArrowLeft,
    FiMessageSquare, FiStar
} from 'react-icons/fi';

const facilityIcons = {
    pool: '🏊', garden: '🌿', ac: '❄️', kitchen: '🍳', parking: '🅿️',
    wifi: '📶', pet_friendly: '🐾', security: '🛡️', power_backup: '⚡',
    waterpark: '🌊', outdoor_games: '⚽', music_system: '🎵', caretaker: '👤',
    metres: '📐', bed: '🛏️', khatla: '🪑', chair: '🪑', zula: '🪆',
    kids_play_area: '🎠', gajebo: '⛺',
};

const SIZE_FACILITIES = ['pool','garden'];
const QTY_FACILITIES = ['metres','bed','khatla','chair','zula'];

// Parse a facility entry like 'pool:big' => { key:'pool', extra:'big', type:'size' }
const parseFacilityEntry = (f) => {
    if (f.includes(':')) {
        const [key, val] = f.split(':');
        const type = SIZE_FACILITIES.includes(key) ? 'size' : QTY_FACILITIES.includes(key) ? 'qty' : 'bool';
        return { key, extra: val, type };
    }
    return { key: f, extra: null, type: 'bool' };
};

const FarmhouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [farmhouse, setFarmhouse] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewKey, setReviewKey] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadFarmhouse();
    }, [id]);

    const loadFarmhouse = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await farmhouseAPI.getById(id);
            setFarmhouse(res.data.data);
            try {
                const simRes = await farmhouseAPI.getAll({ city: res.data.data.location?.city, limit: 3 });
                setSimilar((simRes.data.data || []).filter(f => f._id !== id));
            } catch { /* ignore */ }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load farmhouse');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewAdded = useCallback(() => {
        setReviewKey(prev => prev + 1);
        // Reload farmhouse to get updated rating
        farmhouseAPI.getById(id).then(res => setFarmhouse(res.data.data)).catch(() => {});
    }, [id]);

    if (loading) return <Spinner text={t('common_loading')} />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">😕</span>
                <h2 className="text-xl font-bold text-gray-700 mb-2">{error}</h2>
                <button onClick={() => navigate(-1)} className="btn-primary mt-4">{t('common_back')}</button>
            </div>
        );
    }

    if (!farmhouse) return null;

    const {
        title, description, priceWeekday, priceWeekend, location, images,
        videos, facilities, maxGuests, contactNumber, averageRating, totalReviews
    } = farmhouse;

    return (
        <div className="animate-fade-in pb-24 md:pb-0">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                    <FiArrowLeft className="w-4 h-4" /> {t('common_back')}
                </button>
            </div>

            {/* Gallery */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <ImageGallery images={images} title={title} />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4 text-primary-600" />
                    {location?.city} — {location?.fullAddress}
                </span>
                                <span className="flex items-center gap-1">
                  <FiUsers className="w-4 h-4 text-primary-600" />
                                    {maxGuests} {t('card_guests')}
                </span>
                            </div>
                            {/* Rating Display */}
                            {totalReviews > 0 && (
                                <div className="mt-3 flex items-center gap-2">
                                    <StarDisplay rating={averageRating || 0} size="md" totalReviews={totalReviews} />
                                </div>
                            )}
                        </div>

                        {/* Quick Price Tags */}
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-primary-50 border border-primary-200 rounded-xl px-5 py-3">
                                <p className="text-xs text-primary-600 font-medium">{t('detail_weekday_price')}</p>
                                <p className="text-xl font-bold text-primary-700">
                                    ₹{priceWeekday?.toLocaleString('en-IN')}
                                    <span className="text-sm font-normal">{t('common_per_night')}</span>
                                </p>
                            </div>
                            <div className="bg-accent-50 border border-accent-200 rounded-xl px-5 py-3">
                                <p className="text-xs text-accent-600 font-medium">{t('detail_weekend_price')}</p>
                                <p className="text-xl font-bold text-accent-700">
                                    ₹{priceWeekend?.toLocaleString('en-IN')}
                                    <span className="text-sm font-normal">{t('common_per_night')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('detail_about')}</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
                        </div>

                        {/* Facilities */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('detail_facilities')}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {facilities?.map(fac => {
                                    const { key, extra, type } = parseFacilityEntry(fac);
                                    let label = t(`facility_${key}`);
                                    if (type === 'size') label = `${label} (${t(`facility_size_${extra}`) || extra})`;
                                    if (type === 'qty') label = `${label}: ${extra}`;
                                    return (
                                        <div key={fac} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                                            <span className="text-lg">{facilityIcons[key] || '✅'}</span>
                                            <span className="text-sm text-gray-700 font-medium">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('detail_location')}</h2>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-gray-700 mb-2">
                                    <FiMapPin className="w-4 h-4 inline mr-1 text-primary-600" />
                                    {location?.fullAddress}
                                </p>
                                {location?.googleMapLink && (
                                    <a href={location.googleMapLink} target="_blank" rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                                        <FiExternalLink className="w-4 h-4" /> {t('detail_view_map')}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Videos */}
                        {videos && videos.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('detail_videos')}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {videos.map((vid, idx) => (
                                        <div key={idx} className="rounded-xl overflow-hidden aspect-video">
                                            <iframe src={vid.replace('watch?v=', 'embed/')}
                                                    title={`Video ${idx + 1}`} className="w-full h-full" allowFullScreen loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ GUEST PHOTOS FROM REVIEWS ═══ */}
                        <ReviewPhotosGrid key={`photos-${reviewKey}`} farmhouseId={id} />

                        {/* ═══ REVIEWS SECTION ═══ */}
                        <div id="reviews" className="pt-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FiStar className="w-5 h-5 text-yellow-500" />
                                {t('review_section_title')}
                            </h2>

                            {/* Review List */}
                            <ReviewList key={`list-${reviewKey}`} farmhouseId={id} />

                            {/* Write Review Form */}
                            <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <ReviewForm farmhouse={farmhouse} onReviewAdded={handleReviewAdded} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                        <div id="booking" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <BookingForm farmhouse={farmhouse} />
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-900 mb-3">{t('detail_contact')}</h3>
                                <a href={`tel:+91${contactNumber}`}
                                   className="flex items-center gap-2 text-primary-600 font-medium mb-3">
                                    <FiPhone className="w-4 h-4" /> +91 {contactNumber}
                                </a>
                                <WhatsAppButton contactNumber={contactNumber} farmhouseTitle={title} />
                            </div>
                            {/* Quick Jump to Reviews */}
                            {totalReviews > 0 && (
                                <a href="#reviews"
                                   className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5
                           hover:shadow-md transition-shadow text-center">
                                    <StarDisplay rating={averageRating || 0} size="md" totalReviews={totalReviews} />
                                    <p className="text-sm text-primary-600 font-medium mt-2 flex items-center justify-center gap-1">
                                        <FiMessageSquare className="w-4 h-4" />
                                        {t('review_all_reviews')}
                                    </p>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {similar.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t('detail_similar')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similar.map(fh => <FarmhouseCard key={fh._id} farmhouse={fh} />)}
                    </div>
                </section>
            )}

            {/* ── MOBILE STICKY CTA BAR ── */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white mobile-cta-shadow px-4 py-3 flex items-center gap-3">
                {/* Price */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">From</p>
                    <p className="text-lg font-extrabold text-gray-900 leading-tight">
                        ₹{priceWeekday?.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-gray-500 ml-1">/night</span>
                    </p>
                </div>
                {/* WhatsApp */}
                <a
                    href={`https://wa.me/91${contactNumber}?text=Hi! I'm interested in booking: ${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-500 text-white text-sm font-semibold
                        px-4 py-2.5 rounded-xl shadow-md shadow-green-500/25 active:scale-95 transition-transform flex-shrink-0"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.324-2.234l-.377-.306-2.655.89.89-2.655-.306-.377A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    WhatsApp
                </a>
                {/* Book Now */}
                <a
                    href="#booking"
                    className="flex items-center gap-1.5 bg-primary-600 text-white text-sm font-semibold
                        px-5 py-2.5 rounded-xl shadow-md shadow-primary-600/25 active:scale-95 transition-transform flex-shrink-0"
                >
                    Book Now
                </a>
            </div>
        </div>
    );
};

export default FarmhouseDetail;