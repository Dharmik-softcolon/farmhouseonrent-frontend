import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiMaximize } from 'react-icons/fi';

const ImageGallery = ({ images = [], title = '' }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!images.length) return null;

    const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <>
            {/* Main Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
                {/* Main Image */}
                <div
                    className="md:col-span-2 md:row-span-2 relative group cursor-pointer h-64 md:h-[420px]"
                    onClick={() => {
                        setActiveIndex(0);
                        setLightboxOpen(true);
                    }}
                >
                    <img
                        src={images[0]}
                        alt={`${title} - 1`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <FiMaximize className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Side Images */}
                {images.slice(1, 5).map((img, idx) => (
                    <div
                        key={idx}
                        className={`relative group cursor-pointer h-32 md:h-auto ${idx >= 2 ? 'hidden md:block' : ''}`}
                        onClick={() => {
                            setActiveIndex(idx + 1);
                            setLightboxOpen(true);
                        }}
                    >
                        <img
                            src={img}
                            alt={`${title} - ${idx + 2}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {idx === 3 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">+{images.length - 5} more</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                        {activeIndex + 1} / {images.length}
                    </div>

                    {/* Prev */}
                    <button
                        onClick={goPrev}
                        className="absolute left-2 sm:left-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                    >
                        <FiChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Image */}
                    <img
                        src={images[activeIndex]}
                        alt={`${title} - ${activeIndex + 1}`}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                    />

                    {/* Next */}
                    <button
                        onClick={goNext}
                        className="absolute right-2 sm:right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                    >
                        <FiChevronRight className="w-8 h-8" />
                    </button>

                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all
                  ${activeIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;