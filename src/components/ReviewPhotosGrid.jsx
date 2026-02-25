import { useState, useEffect } from 'react';
import useLanguage from '../hooks/useLanguage';
import { reviewAPI } from '../services/api';
import { FiCamera, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const ReviewPhotosGrid = ({ farmhouseId }) => {
    const { t } = useLanguage();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [lightbox, setLightbox] = useState({ open: false, index: 0 });

    useEffect(() => {
        loadPhotos();
    }, [farmhouseId]);

    const loadPhotos = async () => {
        try {
            const res = await reviewAPI.getPhotos(farmhouseId);
            setPhotos(res.data.data || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    if (loading || photos.length === 0) return null;

    const displayPhotos = showAll ? photos : photos.slice(0, 8);
    const allPhotos = showAll ? photos : displayPhotos;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiCamera className="w-5 h-5 text-primary-600" />
                    {t('review_guest_photos')} ({photos.length})
                </h2>
                {photos.length > 8 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        {showAll ? t('review_show_less') : `${t('review_show_all')} (${photos.length})`}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {displayPhotos.map((photo, idx) => (
                    <button
                        key={idx}
                        onClick={() => setLightbox({ open: true, index: idx })}
                        className="relative group aspect-square rounded-xl overflow-hidden"
                    >
                        <img
                            src={photo.url}
                            alt={`Photo by ${photo.userName}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                        <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/60 text-white
                          rounded-md px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaStar className="w-2 h-2 text-yellow-400" />
                            {photo.rating}
                        </div>
                        {!showAll && idx === 7 && photos.length > 8 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">+{photos.length - 8}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox.open && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center animate-fade-in">
                    <button
                        onClick={() => setLightbox({ open: false, index: 0 })}
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 z-10"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        {lightbox.index + 1} / {allPhotos.length}
                    </div>

                    {/* Photo Info */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                        <span>{allPhotos[lightbox.index]?.userName}</span>
                        <span className="flex items-center gap-0.5">
              <FaStar className="w-3 h-3 text-yellow-400" />
                            {allPhotos[lightbox.index]?.rating}
            </span>
                    </div>

                    <button
                        onClick={() => setLightbox(prev => ({
                            ...prev,
                            index: (prev.index - 1 + allPhotos.length) % allPhotos.length
                        }))}
                        className="absolute left-2 sm:left-4 text-white p-2 rounded-full hover:bg-white/20 z-10"
                    >
                        <FiChevronLeft className="w-8 h-8" />
                    </button>

                    <img
                        src={allPhotos[lightbox.index]?.url}
                        alt="Guest photo"
                        className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg"
                    />

                    <button
                        onClick={() => setLightbox(prev => ({
                            ...prev,
                            index: (prev.index + 1) % allPhotos.length
                        }))}
                        className="absolute right-2 sm:right-4 text-white p-2 rounded-full hover:bg-white/20 z-10"
                    >
                        <FiChevronRight className="w-8 h-8" />
                    </button>

                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
                        {allPhotos.slice(
                            Math.max(0, lightbox.index - 4),
                            Math.min(allPhotos.length, lightbox.index + 5)
                        ).map((photo, idx) => {
                            const realIdx = Math.max(0, lightbox.index - 4) + idx;
                            return (
                                <button
                                    key={realIdx}
                                    onClick={() => setLightbox(prev => ({ ...prev, index: realIdx }))}
                                    className={`flex-shrink-0 w-14 h-12 rounded-lg overflow-hidden border-2 transition-all
                    ${lightbox.index === realIdx ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewPhotosGrid;