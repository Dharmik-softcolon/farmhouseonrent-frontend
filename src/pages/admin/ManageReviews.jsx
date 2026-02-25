import { useState, useEffect } from 'react';
import useLanguage from '../../hooks/useLanguage';
import { reviewAPI } from '../../services/api';
import { StarDisplay } from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { FiStar, FiTrash2, FiCheck, FiX, FiEye, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';

const ManageReviews = () => {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [page, setPage] = useState(1);
    const [filterApproved, setFilterApproved] = useState('all');
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    useEffect(() => {
        loadReviews(page);
    }, [page, filterApproved]);

    const loadReviews = async (pageNum) => {
        setLoading(true);
        try {
            const params = { page: pageNum, limit: 20 };
            if (filterApproved !== 'all') params.approved = filterApproved;
            const res = await reviewAPI.getAll(params);
            setReviews(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
        } catch (err) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (id) => {
        try {
            await reviewAPI.toggleApproval(id);
            toast.success('Review status updated');
            loadReviews(page);
        } catch (err) {
            toast.error('Failed to update review');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            await reviewAPI.delete(id);
            toast.success('Review deleted');
            loadReviews(page);
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <Spinner text={t('common_loading')} />;

    const approvedCount = reviews.filter(r => r.isApproved).length;
    const pendingCount = reviews.filter(r => !r.isApproved).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiStar className="w-6 h-6 text-yellow-500" />
                    {t('review_admin_title')}
                    <span className="text-sm text-gray-500 font-normal">({pagination.total} total)</span>
                </h1>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'true', label: `${t('review_admin_approved')}` },
                        { key: 'false', label: `${t('review_admin_pending')}` }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setFilterApproved(tab.key); setPage(1); }}
                            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors
                ${filterApproved === tab.key
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                    <span className="text-5xl block mb-4">📝</span>
                    <h3 className="text-lg font-bold text-gray-700">No reviews found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review._id}
                             className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm
                ${review.isApproved ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50/30'}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                {/* Left */}
                                <div className="flex-1">
                                    {/* User & Rating */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {review.userName?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{format(new Date(review.createdAt), 'dd MMM yyyy')}</span>
                                                {review.userEmail && <span>• {review.userEmail}</span>}
                                            </div>
                                        </div>
                                        <StarDisplay rating={review.rating} size="sm" showNumber={true} />
                                    </div>

                                    {/* Farmhouse */}
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        🏡 {review.farmhouseId?.title || 'Unknown Farmhouse'}
                                        {review.farmhouseId?.location?.city && ` — ${review.farmhouseId.location.city}`}
                                    </p>

                                    {/* Title */}
                                    {review.title && (
                                        <h5 className="font-semibold text-gray-800 mb-1">{review.title}</h5>
                                    )}

                                    {/* Text */}
                                    <p className="text-gray-600 text-sm leading-relaxed mb-2">{review.reviewText}</p>

                                    {/* Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {review.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setLightbox({ open: true, images: review.images, index: idx })}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <img src={img} alt="" className="w-16 h-16 object-cover hover:opacity-80 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <span className={`badge text-xs ${review.isApproved
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                    {review.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex sm:flex-col gap-2">
                                    <button
                                        onClick={() => handleToggleApproval(review._id)}
                                        className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1
                      ${review.isApproved
                                            ? 'text-yellow-600 hover:bg-yellow-50'
                                            : 'text-green-600 hover:bg-green-50'
                                        }`}
                                        title={review.isApproved ? t('review_admin_unapprove') : t('review_admin_approve')}
                                    >
                                        {review.isApproved ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                                        <span className="hidden sm:inline text-xs">
                      {review.isApproved ? t('review_admin_unapprove') : t('review_admin_approve')}
                    </span>
                                    </button>

                                    {review.farmhouseId?._id && (
                                        <a
                                            href={`/farmhouse/${review.farmhouseId._id}#reviews`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                                            title="View"
                                        >
                                            <FiEye className="w-4 h-4" />
                                            <span className="hidden sm:inline text-xs">View</span>
                                        </a>
                                    )}

                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline text-xs">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">{t('common_prev')}</button>
                    <span className="text-sm text-gray-600">{t('common_page')} {page} / {pagination.pages}</span>
                    <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                            className="btn-secondary text-sm py-2 px-4 disabled:opacity-50">{t('common_next')}</button>
                </div>
            )}

            {/* Lightbox */}
            {lightbox.open && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in">
                    <button onClick={() => setLightbox({ open: false, images: [], index: 0 })}
                            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 z-10">
                        <FiX className="w-6 h-6" />
                    </button>
                    <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        {lightbox.index + 1} / {lightbox.images.length}
                    </div>
                    <button
                        onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }))}
                        className="absolute left-4 text-white p-2 rounded-full hover:bg-white/20 z-10">
                        ←
                    </button>
                    <img src={lightbox.images[lightbox.index]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
                    <button
                        onClick={() => setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }))}
                        className="absolute right-4 text-white p-2 rounded-full hover:bg-white/20 z-10">
                        →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;