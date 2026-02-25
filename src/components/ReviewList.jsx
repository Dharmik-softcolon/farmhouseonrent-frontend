import { useState, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { reviewAPI } from '../services/api';
import { StarDisplay } from './StarRating';
import Spinner from './Spinner';
import { FiThumbsUp, FiChevronDown, FiCamera, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';

const ReviewList = ({ farmhouseId }) => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [sortBy, setSortBy] = useState('newest');
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    useEffect(() => {
        loadReviews(1, sortBy);
    }, [farmhouseId, sortBy]);

    const loadReviews = async (page, sort) => {
        setLoading(true);
        try {
            const res = await reviewAPI.getByFarmhouse(farmhouseId, { page, limit: 10, sort });
            setReviews(res.data.data || []);
            setRatingStats(res.data.ratingStats || null);
            setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            const res = await reviewAPI.markHelpful(reviewId);
            setReviews(prev => prev.map(r =>
                r._id === reviewId ? { ...r, helpfulCount: res.data.data.helpfulCount } : r
            ));
        } catch { /* ignore */ }
    };

    const openLightbox = (images, startIndex = 0) => {
        setLightbox({ open: true, images, index: startIndex });
    };

    const closeLightbox = () => {
        setLightbox({ open: false, images: [], index: 0 });
    };

    // Rating Bar Component
    const RatingBar = ({ star, count, total }) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="w-4 text-gray-600 font-medium">{star}</span>
                <FiChevronDown className="w-3 h-3 text-yellow-400 rotate-[-90deg]" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="w-8 text-gray-500 text-xs text-right">{count}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            {ratingStats && ratingStats.total > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('review_summary')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Left: Overall */}
                        <div className="text-center sm:text-left">
                            <div className="text-5xl font-bold text-gray-900 mb-1">{ratingStats.average}</div>
                            <StarDisplay rating={ratingStats.average} size="md" showNumber={false} />
                            <p className="text-sm text-gray-500 mt-1">
                                {ratingStats.total} {t('review_reviews_count')}
                            </p>
                        </div>

                        {/* Right: Breakdown */}
                        <div className="space-y-1.5">
                            {[5, 4, 3, 2, 1].map(star => (
                                <RatingBar
                                    key={star}
                                    star={star}
                                    count={ratingStats.breakdown[star] || 0}
                                    total={ratingStats.total}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sort */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    {t('review_all_reviews')} ({pagination.total})
                </h3>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                    <option value="newest">{t('review_sort_newest')}</option>
                    <option value="oldest">{t('review_sort_oldest')}</option>
                    <option value="highest">{t('review_sort_highest')}</option>
                    <option value="lowest">{t('review_sort_lowest')}</option>
                    <option value="helpful">{t('review_sort_helpful')}</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <Spinner size="md" text={t('common_loading')} />
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <span className="text-4xl block mb-3">📝</span>
                    <p className="text-gray-500">{t('review_no_reviews')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('review_be_first')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {review.userName?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{format(new Date(review.createdAt), 'dd MMM yyyy')}</span>
                                            {review.visitDate && (
                                                <span>• {t('review_visited')}: {format(new Date(review.visitDate), 'MMM yyyy')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <StarDisplay rating={review.rating} size="sm" showNumber={false} />
                            </div>

                            {/* Title */}
                            {review.title && (
                                <h5 className="font-semibold text-gray-800 mb-1">{review.title}</h5>
                            )}

                            {/* Text */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-3 whitespace-pre-line">
                                {review.reviewText}
                            </p>

                            {/* Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {review.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => openLightbox(review.images, idx)}
                                            className="relative group rounded-xl overflow-hidden"
                                        >
                                            <img
                                                src={img}
                                                alt={`Review by ${review.userName}`}
                                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <FiCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Helpful */}
                            <button
                                onClick={() => handleHelpful(review._id)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            >
                                <FiThumbsUp className="w-3.5 h-3.5" />
                                {t('review_helpful')} {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => loadReviews(pagination.page - 1, sortBy)}
                        disabled={pagination.page <= 1}
                        className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
                    >
                        {t('common_prev')}
                    </button>
                    <span className="text-sm text-gray-600">
            {t('common_page')} {pagination.page} / {pagination.pages}
          </span>
                    <button
                        onClick={() => loadReviews(pagination.page + 1, sortBy)}
                        disabled={pagination.page >= pagination.pages}
                        className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
                    >
                        {t('common_next')}
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {lightbox.open && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in">
                    <button onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10">
                        <FiX className="w-6 h-6" />
                    </button>
                    <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        {lightbox.index + 1} / {lightbox.images.length}
                    </div>
                    <button
                        onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }))}
                        className="absolute left-2 sm:left-4 text-white p-2 rounded-full hover:bg-white/20 z-10">
                        <FiChevronLeft className="w-8 h-8" />
                    </button>
                    <img
                        src={lightbox.images[lightbox.index]}
                        alt="Review photo"
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                    />
                    <button
                        onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
                        className="absolute right-2 sm:right-4 text-white p-2 rounded-full hover:bg-white/20 z-10">
                        <FiChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;